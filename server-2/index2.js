const express = require("express");
const bodyParser = require("body-parser");
const Docker = require("dockerode");
const fs = require("fs");
const app = express();
const { exec, spawn } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const os = require("os");
const { clearTimeout } = require("timers");
const containerPool = {
  java: [],
  cpp: [],
};
let docker;
if (os.platform() === "win32") {
  docker = new Docker({ socketPath: "//./pipe/docker_engine" });
} else {
  docker = new Docker({ socketPath: "/var/run/docker.sock" });
}

const lang = `cpp`;
const code = `
#include<iostream>
int  main(){
std::cout<<"Hello"<<std::endl;
return 0;
}
`;
const input = `5
10`;

const create = (image, pool, containerName) => {
  return new Promise(async (resolve, reject) => {
    try {
      await execPromise(`mkdir "/home/copanda/server-2/${containerName}"`);
      const container = await docker.createContainer({
        Image: image,
        Tty: true,
        name: containerName,
        HostConfig: {
          NetworkMode: "none",
          CpuQuota: 2.5 * 100000,
          Memory: 256 * 1024 * 1024,
          Binds: [`/home/copanda/server-2/${containerName}:/app:ro`],
          ReadonlyRootfs: true,
        },
      });
      await container.start();
      pool.push(container);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const initial = (max) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < max; i++) {
        await create("povtemp/alpinejava", containerPool.java, `javaCon${i}`);
        await create("povtemp/alpinegcc", containerPool.cpp, `gcc.${i}`);
      }
      resolve();
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const getContainer = (pool) => {
  if (pool.length == 0) {
    throw new Error("No available containers");
  }
  return pool.pop();
};
const returnContainer = async (pool, container) => {
  const data = await container.inspect();
  if (!data.State.Running) {
    await container.start();
  }
  pool.push(container);
};

const getPool = (lang) => {
  if (lang === `java`) {
    return containerPool.java;
  } else if (lang === `cpp` || lang === `c`) {
    return containerPool.cpp;
  } else {
    return null;
  }
};

const fun = async (lang, input, code, subId) => {
  try {
    const tempPool = getPool(lang);
    const container = getContainer(tempPool);
    const info = await container.inspect();
    const dirName = info.Name.startsWith("/") ? info.Name.slice(1) : info.Name;
    fs.writeFileSync(`/home/copanda/server-2/${dirName}/Main.${lang}`, code);
    console.log(`code file written!!`);
    fs.writeFileSync(`/home/copanda/server-2/${dirName}/input.txt`, input);
    console.log(`input file written!!`);
    return new Promise(async (resolve, reject) => {
      try {
        const conId = container.id;
        // const srcPath=`D:/projects/ashleel-backend/server-2/${subId}.${lang}`;
        // const desPath=`/Main.${lang}`;
        //    await execPromise(`docker cp ${srcPath} ${conId}:${desPath}`)
        console.log(`code coplied!!`);
        //    await execPromise(`docker cp D:/projects/ashleel-backend/server-2/${subId}.txt ${conId}:/input.txt`);
        console.log(`input file copied!!`);
        let qwerty = -1;
        if (lang === `java`) {
          qwerty = 0;
        }
        if (lang === `cpp`) {
          qwerty = 1;
        }
        if (lang === `c`) {
          qwerty = 2;
        }
        const shellcmd = [
          `javac Main.java`,
          `g++ Main.cpp -o Main`,
          `gcc Main.c -o Main`,
        ];
        await execPromise(
          ` cd /home/copanda/server-2/${dirName} && ${shellcmd[qwerty]} `
        );
        const cmd = [
          `cd /app && java Main.java< input.txt`,
          `cd /app && ./Main < input.txt`,
          `cd /app && ./Main < input.txt`,
        ];
        //    const exec= await container.exec({Cmd:['/bin/sh',`-c`,cmd[qwerty]],AttachStdout:true,AttachStderr:true});
        //    const stream=await exec.start({Detach:false});
        let timeout = null;
        let execProcess;
        // execProcess = exec(`docker exec ${conId} "/bin/sh" -c "${cmd[qwerty]}"`, (err, stdout, stderr) => {
        //     if (timeout !== null) {
        //         console.log(stdout);
        //         console.log(stderr);
        //         console.log(err);
        //         clearTimeout(timeout);
        //         // if (stdout.length === 0) {

        //         returnContainer(tempPool, container);
        //             resolve({ op: stdout, status: true });
        //         // }
        //         // else {
        //         //     reject({ err: stderr, status: false });
        //         // }
        //     }
        // })
        let op = "";
        let errop = "";
        try {
          execProcess = spawn("docker", [
            "exec",
            conId,
            "/bin/sh",
            "-c",
            cmd[qwerty],
          ]);
          execProcess.stdout.setEncoding("utf-8");
          execProcess.stdout.on("data", (data) => {
            op = op + data;
          });
          execProcess.stderr.on("data", (data) => {
            errop += data;
          });
          execProcess.on("close", (code) => {
            if (code == 0) {
              if (timeout !== null) clearTimeout(timeout);
              console.log("the op is done with op as --->");
              console.log(op);
              returnContainer(tempPool, container);
              resolve({ op, status: true });
            } else {
              console.log("error---> ");
              console.log(errop);
              returnContainer(tempPool, container);
              resolve({ err: errop, status: false });
            }
          });
          timeout = setTimeout(async () => {
            try {
              console.log("in timeout!!");
              flag = false;
              execProcess.kill();
              resolve({ op: "TLE", status: false });
              await container.kill();
              returnContainer(tempPool, container);
              //await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
            } catch (err) {
              console.error("Error killing command:", err);
              //await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
            }
          }, 3000);
        } catch (err) {
            console.log("error in exec of cmd !!");
            console.log(err);
            returnContainer(tempPool, container);
            reject(err);
        }

        // let flag = true;
      } catch (err) {
        console.log("error in i do not know what !!!!");
        console.log(err);
        returnContainer(tempPool, container);
        reject(err);
        //await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
      }
    });
  } catch (err) {
    console.log(err);
    // reject(err);
  }
};
const fun1 = async () => {
  try {
    await initial(1);
    console.log(`containers are ready!`);
    // let op = await fun(lang, input, code, "abcd");
    // console.log(op);
  } catch (err) {
    console.log(err);
  }
};
fun1();

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    let rcode = req.body.code;
    let rlang = req.body.lang;
    let rinput = req.body.input;
    let rsubId = req.body.subId;
    let submit = req.body.submit;
    let op = await fun(rlang, rinput, rcode, rsubId);
    console.log(`making request to done server!! `);
    fetch(`https://ashleel-backend.onrender.com/${ (submit) ? "quessubmission" : "submission" }/done`, {
      method: `POST`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: req.body.code,
        lang: req.body.lang,
        input: req.body.input,
        userId: req.body.userid,
        output: op,
        quesId: req.body.quesId,
        subId: req.body.subId,
        status:true
      }),
    });
    res.json({ output: op.op, status: op.status });
  } catch (err) {
    let submit = req.body.submit;
    fetch(`https://ashleel-backend.onrender.com/${ (submit) ? "quessubmission" : "submission" }/done`, {
      method: `POST`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: false,
        mes: `No Free Compiler`,
        code: req.body.code,
        lang: req.body.lang,
        input: req.body.input,
        userId: req.body.userid,
        output: { op: "", status: false },
        quesId: req.body.quesId,
        subId: req.body.subId,
      }),
    });
    console.log(`No free compiler`);
    console.log(err);
    res.json();
  }
});
app.get("/", (req, res) => {
  res.json({ mes: "alive" });
});

app.listen(6996, () => {
  console.log(`file exe server is listening at port 6996`);
});
