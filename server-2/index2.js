
const Redis = require("ioredis");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const SERVER_URL = process.env.SERVER_1_URL;
const REDIS_URL = process.env.REDIS_URL;

// Each container runs exactly ONE language worker.
const LANGUAGE = (process.env.LANGUAGE || "").toLowerCase().trim();

const DAEMON_SOCKET =
  process.env.DAEMON_SOCKET || "/var/run/daemon/daemon.sock";

const EXECUTION_TIMEOUT_MS = Number(
  process.env.EXECUTION_TIMEOUT_MS || 2000
);

const DAEMON_REQUEST_TIMEOUT_MS = Number(
  process.env.DAEMON_REQUEST_TIMEOUT_MS || 15000
);

const LANGUAGE_CONFIG = {
  cpp: { queue: "CPP_QUEUE" },
  c: { queue: "C_QUEUE" },
  python: { queue: "PYTHON_QUEUE" },
  js: { queue: "JS_QUEUE" },
  java: { queue: "JAVA_QUEUE" },
};

const LANGUAGE_ALIASES = {
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  python: "python",
  py: "python",
  js: "js",
  javascript: "js",
  java: "java",
};

function normalizeLanguage(language) {
  return LANGUAGE_ALIASES[
    String(language || "").toLowerCase().trim()
  ] || null;
}

function validateConfiguration() {
  if (!SERVER_URL) {
    throw new Error("SERVER_1_URL is required");
  }

  if (!REDIS_URL) {
    throw new Error("REDIS_URL is required");
  }

  if (!LANGUAGE_CONFIG[LANGUAGE]) {
    throw new Error(
      `Unsupported LANGUAGE="${LANGUAGE}". ` +
      `Supported: ${Object.keys(LANGUAGE_CONFIG).join(", ")}`
    );
  }

  if (!DAEMON_SOCKET) {
    throw new Error("DAEMON_SOCKET is required");
  }
}

function executeCode(job) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      language: LANGUAGE,
      source_code: job.code,
      stdin: job.input || "",
      timeout_ms: EXECUTION_TIMEOUT_MS,
    });

    const req = http.request(
      {
        socketPath: DAEMON_SOCKET,
        path: "/execute",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";

        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          let result;

          try {
            result = JSON.parse(data);
          } catch {
            return reject(
              new Error("Daemon returned invalid JSON")
            );
          }

          if (res.statusCode !== 200) {
            return reject(
              new Error(
                result.error || `Daemon HTTP ${res.statusCode}`
              )
            );
          }

          resolve(result);
        });

        res.on("error", reject);
      }
    );

    req.setTimeout(DAEMON_REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error("Daemon request timed out"));
    });

    req.on("error", reject);
    req.end(payload);
  });
}

function formatOutput(result) {
  const success = result.status === "OK";

  return {
    op: success
      ? result.stdout || ""
      : result.stderr || result.error || result.status,

    status: success,

    daemonStatus: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exitCode: result.exit_code,

    compileTimeMs: result.compile_time_ms,
    wallTimeMs: result.wall_time_ms,
    cpuTimeMs: result.cpu_time_ms,
    maxMemoryKB: result.max_memory_kb,

    error: result.error || null,
  };
}

async function notifyServer(payload) {
  const response = await fetch(
    `${SERVER_URL}/submission/done`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(`Backend HTTP ${response.status}`);
  }
}

async function processJob(job, redis, workerName) {
  const {
    code,
    input,
    userId,
    quesId,
    jobId,
  } = job;

  console.log(`[${workerName}] Executing job ${jobId}`);

  let output;

  try {
    const normalizedJobLanguage = normalizeLanguage(job.lang);

    if (normalizedJobLanguage !== LANGUAGE) {
      throw new Error(
        `Language mismatch: worker=${LANGUAGE}, job=${job.lang}`
      );
    }

    if (typeof code !== "string" || !code.trim()) {
      throw new Error("Job source code is empty");
    }

    const result = await executeCode(job);

    output = formatOutput(result);

    console.log(
      `[${workerName}] Job ${jobId}: ${result.status}`
    );
  } catch (err) {
    console.error(
      `[${workerName}] Execution error:`,
      err
    );

    output = {
      op: err.message,
      status: false,
      error: err.message,
    };
  }

  try {
    await notifyServer({
      code,
      lang: LANGUAGE,
      input: input || "",
      userId,
      output,
      quesId,
      jobId,
      status: true,
    });

    console.log(
      `[${workerName}] Job ${jobId} delivered`
    );
  } catch (err) {
    console.error(
      `[${workerName}] Failed to notify backend:`,
      err
    );

    // Production improvement:
    // Persist failed callbacks to a retry queue.
  } finally {
    if (userId) {
      try {
        await redis.del(userId);
      } catch (err) {
        console.error(
          `[${workerName}] Failed to release user lock:`,
          err
        );
      }
    }
  }
}

async function startWorker() {
  validateConfiguration();

  const config = LANGUAGE_CONFIG[LANGUAGE];
  const workerName =
    `${LANGUAGE}-worker-${process.env.WORKER_ID || "1"}`;

  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  redis.on("error", (err) => {
    console.error(`[${workerName}] Redis error:`, err);
  });

  console.log("----------------------------------");
  console.log(`Worker:       ${workerName}`);
  console.log(`Language:     ${LANGUAGE}`);
  console.log(`Queue:        ${config.queue}`);
  console.log(`Daemon:       ${DAEMON_SOCKET}`);
  console.log("----------------------------------");

  try {
    await redis.ping();

    console.log(`[${workerName}] Connected to Redis`);

    while (true) {
      try {
        const jobData = await redis.brpop(config.queue, 0);

        if (!jobData) {
          continue;
        }

        let job;

        try {
          job = JSON.parse(jobData[1]);
        } catch (err) {
          console.error(
            `[${workerName}] Invalid job JSON:`,
            err
          );
          continue;
        }

        await processJob(job, redis, workerName);
      } catch (err) {
        console.error(
          `[${workerName}] Worker loop error:`,
          err
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      }
    }
  } finally {
    await redis.quit();
  }
}

startWorker().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
