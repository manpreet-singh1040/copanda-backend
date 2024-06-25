const {exec}=require('child_process');
const util=require('util');
const asyncExec=util.promisify(exec);



const funC=(input,fileName)=>{
    return new Promise(async(resolve,reject)=>{


        try{
    
            console.log(`inside fileexec`)
            const{stderr,stdout}=await asyncExec(`gcc ${fileName}.c -o pro${fileName}`);
            console.log(`completed exec`)
            console.log(`first exec op${stdout}`)
            if(stderr){
                console.log(`error output!!`);
                console.log(stderr);
                reject(stderr);
            }
            const execute=exec(`./pro${fileName}`);
            execute.stdin.write(input);
            execute.stdin.end();
            let op=``;
            let errop=``;
    
            for await(const chunk of execute.stdout)
            {
                op+=chunk;
            }
            for await(const chunk of execute.stderr)
            {
                errop+=chunk;
            }
            execute.on('exit',(code)=>{
                exec(`rm pro${fileName} && rm ${fileName}.c`);
                console.log(`exised`);
                resolve(op);

            })
        }
        catch(err){
            console.log(`try catch err${err}`);
            reject(err);
        }
    })
}
//fun();
const funJava =async(input,fileName)=>{
    return new Promise(async(resolve,reject)=>{
        const childProcess = exec(`java ${fileName}.java`);
        let op=``;
    childProcess.stdin.write(input);
    childProcess.stdin.end();

    childProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
        op+=data;
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reject(data);
    });

    childProcess.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
            resolve (op);
        exec(`rm ${fileName}.java`);
    });
    })
};

const funCpp=(input,fileName)=>{
    return new Promise(async(resolve,reject)=>{


        try{
    
            console.log(`inside fileexec`)
            const{stderr,stdout}=await asyncExec(`g++ ${fileName}.cpp -o pro${fileName}`);
            console.log(`completed exec`)
            console.log(`first exec op${stdout}`)
            if(stderr){
                console.log(`error output!!`);
                console.log(stderr);
                reject(stderr);
            }
            const execute=exec(`./pro${fileName}`);
            execute.stdin.write(input);
            execute.stdin.end();
            let op=``;
            let errop=``;
    
            for await(const chunk of execute.stdout)
            {
                op+=chunk;
            }
            for await(const chunk of execute.stderr)
            {
                errop+=chunk;
            }
            execute.on('exit',(code)=>{
                exec(`rm pro${fileName} && rm ${fileName}.cpp`);
                console.log(`exised`);
                resolve(op);

            })
        }
        catch(err){
            console.log(`try catch err${err}`);
            reject(err);
        }
    })
}
module.exports={funC,funJava,funCpp};

