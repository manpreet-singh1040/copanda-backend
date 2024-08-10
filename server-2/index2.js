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
                Tty:true
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
    const container=getContainer(tempPool);
    return new Promise(async(resolve,reject)=>{
        try{
        const conId=container.id;
        const srcPath=`D:/projects/ashleel-backend/${subId}.${lang}`;
        const desPath=`/${subId}.${lang}`;
           await execPromise(`docker cp ${srcPath} ${conId}:${desPath}`)
           console.log(`code coplied!!`);
           await execPromise(`docker cp D:/projects/ashleel-backend/${subId}.txt ${conId}:/${subId}.txt`);
           console.log(`input file copied!!`);
//          
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
           const cmd=[`javac ${subId}.java && java ${subId} && rm ${subId}.java && rm ${subId}.class && rm ${subId}.txt`,`g++ ${subId}.cpp -o ${subId} && ./${subId}`,`gcc ${subId}.c -o ${subId} && ./${subId}`];
           const exec= await container.exec({Cmd:['/bin/sh',`-c`,cmd[qwerty]],AttachStdout:true,AttachStderr:true});
           const stream=await exec.start({Detach:false});
           
           let flag=true;
           const timeout = setTimeout(async () => {
            try {

                flag=false;
                    resolve({op:"TLE",status:false});
                    await container.kill();
                    returnContainer(tempPool,container);
            } catch (err) {
                console.error('Error killing command:', err);
            }
        }, 1500);
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
                    }
                    else{
                        output=null;
                    }
                })
                stream.on('error',async(err)=>{
                    clearTimeout(timeout);
                    reject(err);
                })
        }
        catch(err){
            reject(err);
        }
        
    })
}
const fun1=async()=>{
    await initial(1);
    console.log(`containers are ready!`);
}
fun1();




app.use(bodyParser.json());

app.post("/java",async(req,res)=>{
    
    let rcode=req.body.code;
    let rlang=req.body.lang;
    let rinput=req.body.input;
    let rsubId=req.body.subId;
    let op=await fun(rlang,rinput,rcode,rsubId);
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