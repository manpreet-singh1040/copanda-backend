const express=require("express");
const bodyParser = require('body-parser');
const Docker=require("dockerode");
const fs=require('fs');
const app=express();
const {exec}=require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);


const os=require('os');
const containerPool={
    java:[],
    cpp:[]
}
let docker;
if (os.platform() === 'win32') {
    docker = new Docker({ socketPath: '//./pipe/docker_engine' });
  } else {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }
  




const lang=`java`;
const code=`import java.util.*;
import java.io.*;
public class ash123
{
	public static void main(String[] args) {
		try{
			File input=new File("ash123.txt");
			System.out.println("Hello World");
			Scanner sc=new Scanner(input);
			int a=sc.nextInt();
			System.out.println(a);
			int b=sc.nextInt();
			System.out.println(b);
            int i=-1;
            while(i<0)
            {
              System.out.println("hehe");
              i--;
            }
			sc.close();
		}
		catch(FileNotFoundException e){
			System.out.println(e);
		}
	}
}`;
const input=`5
10`;











const create=(image,pool)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const container=await docker.createContainer({
                Image:image,
                Tty:true,
                HostConfig:{
                    NetworkMode:'none'
                }
            })
            await container.start();
            pool.push(container);
            resolve();
        }
        catch(err){
            reject(err);
        }
        
    })
}

const initial=(max)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            for(let i=0;i<max;i++)
            {
                await create("povtemp/alpinejava",containerPool.java);
                await create("povtemp/alpinegcc",containerPool.cpp);
            }
            resolve();
        }
        catch(err){
            console.log(err);
            reject(err);
        }
    })
}


const getContainer=(pool)=>{
    if(pool.length==0)
    {
        throw new Error('No available containers');
    }
    return pool.pop();
}
const returnContainer=async(pool,container)=>{
    const data=await container.inspect();
    if(!data.State.Running)
    {
        await container.start();
    }
    pool.push(container);
}

const getPool=(lang)=>{
    if(lang===`java`)
    {
        return containerPool.java;
    }
    else if(lang===`cpp` || lang===`c`)
    {
        return containerPool.cpp;
    }
    else{
        return null;
    }
}



const fun=async(lang,input,code,subId)=>{
    fs.writeFileSync(`${subId}.${lang}`,code);
    console.log(`code file written!!`);
    fs.writeFileSync(`${subId}.txt`,input);
    console.log(`input file written!!`);
    const tempPool=getPool(lang);
    return new Promise(async(resolve,reject)=>{
        try{
        const container=getContainer(tempPool);
        const conId=container.id;
        const srcPath=`D:/projects/ashleel-backend/server-2/${subId}.${lang}`;
        const desPath=`/Main.${lang}`;
           await execPromise(`docker cp ${srcPath} ${conId}:${desPath}`)
           console.log(`code coplied!!`);
           await execPromise(`docker cp D:/projects/ashleel-backend/server-2/${subId}.txt ${conId}:/input.txt`);
           console.log(`input file copied!!`);        
           let qwerty=-1;
           if(lang===`java`)
           {
               qwerty=0;
           }
           if(lang===`cpp`)
           {
               qwerty=1;
           }
           if(lang===`c`)
           {
            qwerty=2;
           }
           const cmd=[`javac Main.java && java Main < input.txt && rm Main.java && rm Main.class && rm input.txt`,`g++ Main.cpp -o ${subId} && ./${subId} < input.txt`,`gcc Main.c -o ${subId} && ./${subId} < input.txt`];
           const exec= await container.exec({Cmd:['/bin/sh',`-c`,cmd[qwerty]],AttachStdout:true,AttachStderr:true});
           const stream=await exec.start({Detach:false});
           
           let flag=true;
           const timeout = setTimeout(async () => {
            try {

                flag=false;
                    resolve({op:"TLE",status:false});
                    await container.kill();
                    returnContainer(tempPool,container);
                    await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
            } catch (err) {
                console.error('Error killing command:', err);
                await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
            }
        }, 3000);
                let output = Buffer.alloc(0);
                stream.on('data',async(chunk)=>{
                    if(flag){
                        output = Buffer.concat([output, chunk]);
                    }
                })
                stream.on('end',async()=>{
                    if(flag)
                    {
                    clearTimeout(timeout);
                    console.log(`done!!`);
                    const asciiOutput = output.toString('ascii');
                    const cleanOutput = asciiOutput.replace(/[^\x20-\x7E\n]/g, '');
                        resolve({op:cleanOutput,status:true});
                        returnContainer(tempPool,container);
                        await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);

                    }
                    else{
                        output=null;
                    }
                })
                stream.on('error',async(err)=>{
                    clearTimeout(timeout);
                    reject(err);
                    await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
                })
        }
        catch(err){
            reject(err);
            await execPromise(`rm -f ${subId}.${lang} && rm -f ${subId}.txt`);
        }
        
    })
}
const fun1=async()=>{
    await initial(1);
    console.log(`containers are ready!`);
}
fun1();




app.use(bodyParser.json());

app.post("/",async(req,res)=>{
    
    let rcode=req.body.code;
    let rlang=req.body.lang;
    let rinput=req.body.input;
    let rsubId=req.body.subId;
    let op=await fun(rlang,rinput,rcode,rsubId);
    console.log(`making request to done server!!`);
    fetch("http://localhost:3000/submission/done",{
        method:`POST`,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({code:req.body.code,lang:req.body.lang,input:req.body.input,userId:req.body.userid,output:op,quesId:req.body.quesId,subId:req.body.subId})
    });
    res.json({output:op.op,status:op.status});
})
app.post("/cpp",async(req,res)=>{
    let rcode=req.body.code;
    let rlang=req.body.lang;
    let rinput=req.body.input;
    let rsubId=req.body.subId;
    let op=await fun(rlang,rinput,rcode,rsubId);
    res.json({output:op.op,status:op.status});
})
app.post("/c",async(req,res)=>{
    let rcode=req.body.code;
    let rlang=req.body.lang;
    let rinput=req.body.input;
    let rsubId=req.body.subId;
    let op=await fun(rlang,rinput,rcode,rsubId);
    res.json({output:op.op,status:op.status});
})
app.get("/",(req,res)=>{
    res.json({mes:"alive"});
})

app.listen(6996,()=>{console.log(`file exe server is listening at port 6996`)})