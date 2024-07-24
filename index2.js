require('dotenv/config');
require('dotenv').config();
const express=require("express");
const bodyParser = require('body-parser');
const Docker=require("dockerode");
const fs=require('fs');
const app=express();
const {exec}=require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const containerPool={
    java:[],
    cpp:[],
    c:[]
}
const docker = new Docker({ socketPath: '//./pipe/docker_engine' });









/*const lang=`java`;
const code=`import java.util.*;
import java.io.*;
public class test
{
	public static void main(String[] args) {
		try{

			File input=new File("input.txt");
			System.out.println("Hello World");
			Scanner sc=new Scanner(input);
			int a=sc.nextInt();
			System.out.println(a);
			int b=sc.nextInt();
			System.out.println(b);
			sc.close();
		}
		catch(FileNotFoundException e){
			System.out.println(e);
		}
	}
}`;
const input=`5
10`;*/











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

const initial=()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            await create("openjdk:latest",containerPool.java);
            await create("gcc:latest",containerPool.c);
            await create("gcc:latest",containerPool.cpp);
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
const fun=async(lang,input,code)=>{
    //const container=await create("ubuntu:latest",containerPool.java);
    fs.writeFileSync(`test.${lang}`,code);
    console.log(`code file written!!`);
    fs.writeFileSync(`input.txt`,input);
    console.log(`input file written!!`);
    await initial();
    const container=getContainer(containerPool.java);
    
    console.log(`container started!!`);
    return new Promise(async(resolve,reject)=>{
        try{

            /*await container.putArchive({
                path:`test.java`,
                src:fs.createReadStream('./test')
            },{path:`./app`})

            await container.putArchive({
                path: 'input.txt',
                src: fs.createReadStream('./input.txt')
            }, { path: '/app' });*/
            
///        to correct copying files  ---->done!!

        const conId=container.id;
        const srcPath=`D:/projects/ashleel-backend/test.${lang}`;
        const desPath=`/test.${lang}`;
        //await execPromise(`mkdir app`);
        //console.log(`path created`);
           await execPromise(`docker cp ${srcPath} ${conId}:${desPath}`)
           console.log(`code coplied!!`);
           await execPromise(`docker cp D:/projects/ashleel-backend/input.txt ${conId}:/input.txt`);
           console.log(`input file copied!!`);
//    
            container.exec({Cmd:['/bin/sh',`-c`,` javac test.java && java test && rm test.java && rm test.class && rm input.txt`],AttachStdout:true,AttachStderr:true}).then((exe)=>{
                return exe.start({Detach:false});
            }).then(stream=>{
                let output = Buffer.alloc(0);
                stream.on('data',chunk=>{
                    output = Buffer.concat([output, chunk]);
                })
                stream.on('end',()=>{
                    console.log(`done!!`);
                    const asciiOutput = output.toString('ascii');
                    const cleanOutput = asciiOutput.replace(/[^\x20-\x7E\n]/g, '');
                    resolve(cleanOutput);
                })
                stream.on('error',err=>{
                    reject(err);
                })
            })
        }
        catch(err){
            reject(err);
        }
        
    })
}
const fun1=async()=>{
    const mes=await fun(lang,input,code);
    console.log(mes);
}
//fun1();




app.use(bodyParser.json());

app.post("/java",async(req,res)=>{
    
    let rcode=req.body.code;
    let rlang=req.body.lang;
    let rinput=req.body.input;
    let op=await fun(rlang,rinput,rcode);
    res.json({output:op});
})
app.post("/cpp",(req,res)=>{
    
})
app.post("/c",(req,res)=>{
    
})
app.get("/",(req,res)=>{
    res.json({mes:"alive"});
})

app.listen(6996,()=>{console.log(`file exe server is listening at port 6996`)})