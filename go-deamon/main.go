
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	socketPath = "/var/run/daemon/daemon.sock"
	workBaseDir = "/sandbox/work"

	untrustedUID = 65534
	untrustedGID = 65534

	maxOutputBytes  = 512 * 1024
	maxRequestBytes = 2 * 1024 * 1024

	defaultCompileMs = 5000
	defaultExecMs    = 2000
	maxAllowedExecMs = 3000

	defaultJavaMemoryMB = 128
)

var (
	errOutputLimitExceeded = errors.New("output limit exceeded")
	errInvalidCommand      = errors.New("empty command")
)

// Request from Node.js worker.
type JobRequest struct {
	Language   string `json:"language"`
	SourceCode string `json:"source_code"`
	Stdin      string `json:"stdin"`
	TimeoutMs  int    `json:"timeout_ms"`
}

// Response expected by Node.js worker.
type JobResponse struct {
	Status        string `json:"status"`
	Stdout        string `json:"stdout"`
	Stderr        string `json:"stderr"`
	ExitCode      int    `json:"exit_code"`
	CompileTimeMs int64  `json:"compile_time_ms"`
	WallTimeMs    int64  `json:"wall_time_ms"`
	CpuTimeMs     int64  `json:"cpu_time_ms"`
	MaxMemoryKB   int64  `json:"max_memory_kb"`
	Error         string `json:"error,omitempty"`
}

// LimitedBuffer prevents excessive compiler/program output.
type LimitedBuffer struct {
	buf       bytes.Buffer
	limit     int
	truncated bool
}

func (l *LimitedBuffer) Write(p []byte) (int, error) {
	remaining := l.limit - l.buf.Len()

	if remaining <= 0 {
		if len(p) > 0 {
			l.truncated = true
			return 0, errOutputLimitExceeded
		}
		return 0, nil
	}

	if len(p) > remaining {
		n, err := l.buf.Write(p[:remaining])
		if err != nil {
			return n, err
		}

		l.truncated = true
		return n, errOutputLimitExceeded
	}

	return l.buf.Write(p)
}

func (l *LimitedBuffer) String() string {
	if l.truncated {
		return l.buf.String() +
			"\n... [output truncated: exceeded 512 KB limit]"
	}

	return l.buf.String()
}

// Normalize language aliases.
func normalizeLanguage(lang string) string {
	lang = strings.ToLower(strings.TrimSpace(lang))

	switch lang {
	case "c":
		return "c"

	case "cpp", "c++":
		return "cpp"

	case "python", "py":
		return "python"

	case "js", "javascript":
		return "js"

	case "java":
		return "java"

	default:
		return ""
	}
}

func main() {
	// Work directory.
	if err := os.MkdirAll(workBaseDir, 0755); err != nil {
		log.Fatalf("failed to create workspace: %v", err)
	}

	// Socket directory.
	socketDir := filepath.Dir(socketPath)

	if err := os.MkdirAll(socketDir, 0770); err != nil {
		log.Fatalf("failed to create socket directory: %v", err)
	}

	if err := os.Chmod(socketDir, 0770); err != nil {
		log.Fatalf("failed to set socket directory permissions: %v", err)
	}

	// Optional shared group ID for Node.js container.
	if groupID := os.Getenv("DAEMON_SOCKET_GID"); groupID != "" {
		gid, err := strconv.Atoi(groupID)
		if err != nil || gid < 0 {
			log.Fatalf("invalid DAEMON_SOCKET_GID: %s", groupID)
		}

		if err := os.Chown(socketDir, -1, gid); err != nil {
			log.Fatalf("failed to set socket directory group: %v", err)
		}
	}

	// Remove stale socket.
	if err := os.Remove(socketPath); err != nil &&
		!errors.Is(err, os.ErrNotExist) {
		log.Fatalf("failed to remove stale socket: %v", err)
	}

	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		log.Fatalf("failed to listen on socket: %v", err)
	}

	defer listener.Close()
	defer os.Remove(socketPath)

	if err := os.Chmod(socketPath, 0660); err != nil {
		log.Fatalf("failed to set socket permissions: %v", err)
	}

	if groupID := os.Getenv("DAEMON_SOCKET_GID"); groupID != "" {
		gid, _ := strconv.Atoi(groupID)

		if err := os.Chown(socketPath, -1, gid); err != nil {
			log.Fatalf("failed to set socket group: %v", err)
		}
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/execute", handleExecute)
	mux.HandleFunc("/health", handleHealth)

	server := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       30 * time.Second,
		MaxHeaderBytes:    16 * 1024,
	}

	sigChan := make(chan os.Signal, 1)

	signal.Notify(
		sigChan,
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer signal.Stop(sigChan)

	go func() {
		<-sigChan

		log.Println("Shutting down execution daemon...")

		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)

		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("shutdown error: %v", err)
			_ = server.Close()
		}
	}()

	log.Printf("Execution daemon listening on %s", socketPath)

	if err := server.Serve(listener); err != nil &&
		!errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("HTTP server error: %v", err)
	}
}

// Health endpoint.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{
		"healthy": true,
	})
}

// Execution endpoint.
func handleExecute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	defer r.Body.Close()

	var req JobRequest

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  fmt.Sprintf("invalid JSON: %v", err),
		})
		return
	}

	// Reject additional JSON values.
	var extra any

	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		writeJSON(w, http.StatusBadRequest, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  "request must contain exactly one JSON object",
		})
		return
	}

	req.Language = normalizeLanguage(req.Language)

	if req.Language == "" {
		writeJSON(w, http.StatusBadRequest, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  "unsupported language",
		})
		return
	}

	if req.SourceCode == "" {
		writeJSON(w, http.StatusBadRequest, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  "source_code cannot be empty",
		})
		return
	}

	// Execution timeout.
	execTimeoutMs := req.TimeoutMs

	if execTimeoutMs <= 0 {
		execTimeoutMs = defaultExecMs
	}

	if execTimeoutMs > maxAllowedExecMs {
		execTimeoutMs = maxAllowedExecMs
	}

	// Create isolated job directory.
	jobDir, err := os.MkdirTemp(workBaseDir, "job-*")

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  "failed to allocate workspace",
		})
		return
	}

	defer func() {
		if err := os.RemoveAll(jobDir); err != nil {
			log.Printf("workspace cleanup failed: %v", err)
		}
	}()

	// Prepare source and commands.
	compileArgs, runArgs, err := prepareLanguageCommands(
		req.Language,
		req.SourceCode,
		jobDir,
	)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  err.Error(),
		})
		return
	}

	// Allow nobody to create compiler output in this workspace.
	if err := os.Chown(jobDir, untrustedUID, untrustedGID); err != nil {
		writeJSON(w, http.StatusInternalServerError, JobResponse{
			Status: "INTERNAL_ERROR",
			Error:  "failed to set workspace ownership",
		})
		return
	}

	var compileTimeMs int64

	// Compilation stage.
	if len(compileArgs) > 0 {
		compileRes, compileErr := runIsolatedProcess(
			jobDir,
			compileArgs,
			"",
			time.Duration(defaultCompileMs)*time.Millisecond,
		)

		compileTimeMs = compileRes.WallTimeMs

		if errors.Is(compileErr, context.DeadlineExceeded) {
			writeJSON(w, http.StatusOK, JobResponse{
				Status:        "COMPILE_TLE",
				Stdout:        compileRes.Stdout,
				Stderr:        compileRes.Stderr,
				ExitCode:      124,
				CompileTimeMs: compileTimeMs,
				Error:         "compilation time limit exceeded",
			})
			return
		}

		if errors.Is(compileErr, errOutputLimitExceeded) {
			writeJSON(w, http.StatusOK, JobResponse{
				Status:        "OUTPUT_LIMIT_EXCEEDED",
				Stdout:        compileRes.Stdout,
				Stderr:        compileRes.Stderr,
				ExitCode:      compileRes.ExitCode,
				CompileTimeMs: compileTimeMs,
				Error:         "compiler output exceeded 512 KB",
			})
			return
		}

		if compileErr != nil || compileRes.ExitCode != 0 {
			writeJSON(w, http.StatusOK, JobResponse{
				Status:        "COMPILE_ERROR",
				Stdout:        compileRes.Stdout,
				Stderr:        compileRes.Stderr,
				ExitCode:      compileRes.ExitCode,
				CompileTimeMs: compileTimeMs,
				Error:         "compilation failed",
			})
			return
		}
	}

	// Runtime stage.
	execRes, execErr := runIsolatedProcess(
		jobDir,
		runArgs,
		req.Stdin,
		time.Duration(execTimeoutMs)*time.Millisecond,
	)

	execRes.CompileTimeMs = compileTimeMs

	switch {
	case errors.Is(execErr, context.DeadlineExceeded):
		execRes.Status = "RUNTIME_TLE"
		execRes.ExitCode = 124
		execRes.Error = fmt.Sprintf(
			"time limit exceeded (%dms)",
			execTimeoutMs,
		)

	case errors.Is(execErr, errOutputLimitExceeded):
		execRes.Status = "OUTPUT_LIMIT_EXCEEDED"
		execRes.Error = "program output exceeded 512 KB"

	case execErr != nil || execRes.ExitCode != 0:
		execRes.Status = "RUNTIME_ERROR"

		if execErr != nil {
			execRes.Error = execErr.Error()
		} else {
			execRes.Error = "program exited with non-zero status"
		}

	default:
		execRes.Status = "OK"
	}

	writeJSON(w, http.StatusOK, execRes)
}

// Run a process as nobody in a separate process group.
func runIsolatedProcess(
	workDir string,
	args []string,
	stdinData string,
	timeout time.Duration,
) (JobResponse, error) {
	var resp JobResponse

	if len(args) == 0 || strings.TrimSpace(args[0]) == "" {
		return resp, errInvalidCommand
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		timeout,
	)

	defer cancel()

	cmd := exec.CommandContext(ctx, args[0], args[1:]...)

	cmd.Dir = workDir

	cmd.Env = []string{
		"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
		"HOME=" + workDir,
		"TMPDIR=" + workDir,
	}

	cmd.Stdin = strings.NewReader(stdinData)

	stdout := &LimitedBuffer{
		limit: maxOutputBytes,
	}

	stderr := &LimitedBuffer{
		limit: maxOutputBytes,
	}

	cmd.Stdout = stdout
	cmd.Stderr = stderr

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Credential: &syscall.Credential{
			Uid:         uint32(untrustedUID),
			Gid:         uint32(untrustedGID),
			NoSetGroups: true,
		},
		Setpgid:   true,
		Pdeathsig: syscall.SIGKILL,
	}

	// Kill the complete process group on timeout.
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return nil
		}

		err := syscall.Kill(
			-cmd.Process.Pid,
			syscall.SIGKILL,
		)

		if errors.Is(err, syscall.ESRCH) {
			return nil
		}

		return err
	}

	cmd.WaitDelay = 100 * time.Millisecond

	start := time.Now()

	runErr := cmd.Run()

	resp.WallTimeMs = time.Since(start).Milliseconds()

	resp.Stdout = stdout.String()
	resp.Stderr = stderr.String()

	if cmd.ProcessState != nil {
		resp.ExitCode = cmd.ProcessState.ExitCode()

		if usage, ok := cmd.ProcessState.SysUsage().(*syscall.Rusage); ok &&
			usage != nil {

			userMs := usage.Utime.Sec*1000 +
				usage.Utime.Usec/1000

			systemMs := usage.Stime.Sec*1000 +
				usage.Stime.Usec/1000

			resp.CpuTimeMs = userMs + systemMs
			resp.MaxMemoryKB = usage.Maxrss
		}
	}

	// Sweep any remaining descendants.
	if cmd.Process != nil {
		err := syscall.Kill(
			-cmd.Process.Pid,
			syscall.SIGKILL,
		)

		if err != nil && !errors.Is(err, syscall.ESRCH) {
			log.Printf("process cleanup failed: %v", err)
		}
	}

	if errors.Is(ctx.Err(), context.DeadlineExceeded) {
		return resp, context.DeadlineExceeded
	}

	if stdout.truncated ||
		stderr.truncated ||
		errors.Is(runErr, errOutputLimitExceeded) {

		return resp, errOutputLimitExceeded
	}

	return resp, runErr
}

// Prepare compiler and execution commands.
func prepareLanguageCommands(
	lang string,
	code string,
	jobDir string,
) (compileArgs, runArgs []string, err error) {

	writeSource := func(filename string) (string, error) {
		path := filepath.Join(jobDir, filename)

		if err := os.WriteFile(
			path,
			[]byte(code),
			0644,
		); err != nil {
			return "", fmt.Errorf(
				"failed to write source file: %w",
				err,
			)
		}

		return path, nil
	}

	switch lang {

	case "c":
		src, err := writeSource("main.c")

		if err != nil {
			return nil, nil, err
		}

		bin := filepath.Join(jobDir, "main.out")

		return []string{
				"gcc",
				"-O2",
				src,
				"-o",
				bin,
				"-lm",
			},
			[]string{bin},
			nil

	case "cpp":
		src, err := writeSource("main.cpp")

		if err != nil {
			return nil, nil, err
		}

		bin := filepath.Join(jobDir, "main.out")

		return []string{
				"g++",
				"-O2",
				"-std=c++20",
				src,
				"-o",
				bin,
			},
			[]string{bin},
			nil

	case "python":
		src, err := writeSource("main.py")

		if err != nil {
			return nil, nil, err
		}

		return nil, []string{
			"python3",
			"-I",
			"-B",
			src,
		}, nil

	case "js":
		src, err := writeSource("main.js")

		if err != nil {
			return nil, nil, err
		}

		return nil, []string{
			"node",
			"--max-old-space-size=128",
			src,
		}, nil

	case "java":
		src, err := writeSource("Main.java")

		if err != nil {
			return nil, nil, err
		}

		// Compile into the job workspace.
		return []string{
				"javac",
				"-J-Xmx256m",
				"-encoding",
				"UTF-8",
				"-d",
				jobDir,
				src,
			},
			[]string{
				"java",
				fmt.Sprintf("-Xmx%dm", defaultJavaMemoryMB),
				"-cp",
				jobDir,
				"Main",
			},
			nil

	default:
		return nil, nil, fmt.Errorf(
			"unsupported language: %q",
			lang,
		)
	}
}

// JSON response helper.
func writeJSON(
	w http.ResponseWriter,
	status int,
	payload any,
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("JSON response error: %v", err)
	}
}
