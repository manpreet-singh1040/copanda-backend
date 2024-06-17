const {exec}=require('child_process');
const funC=(input,fileName)=>{
exec(`gcc ${fileName}.c -o pro${fileName}`,(err,stdout,stderr)=>{
    if(err)
        {
            console.log(`err in compilation!`);
            console.log(err);
            return err;
        }
        if(stderr){
            console.log(`error output!!`);
            console.log(stderr);
            return stderr;
        }
        const childProcess=exec(`./pro${fileName}`,async(err,stdout,stderr)=>{
            if(err){
                console.log(err);
                return;
            }
            exec(`rm pro${fileName}`);
            if(stderr){
                console.log(stderr);
                return stderr;
            }
            console.log(`the output is:${stdout}`);
            return(stdout);
        });
        childProcess.stdin.write(input);
        childProcess.stdin.end();
});
}
//fun();
const funJava = (input,fileName) => {
    const childProcess = exec(`java ${fileName}.java`);

    childProcess.stdin.write(input);
    childProcess.stdin.end();

    childProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
        return data;
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        return data;
    });

    childProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Child process exited with code ${code}`);
        }
    });
};

//funJava('32\n45');

const funCpp=(input,fileName)=>{
    exec(`g++ ${fileName}.cpp -o pro${fileName}`,(err,stdout,stderr)=>{
        if(err)
            {
                console.log(`err in compilation!`);
                console.log(err);
                return err;
            }
            if(stderr){
                console.log(`error output!!`);
                console.log(stderr);
                return stderr;
            }
            const childProcess=exec(`./pro${fileName}`,(err,stdout,stderr)=>{
                if(err){
                    console.log(err);
                    return err;
                }
                exec(`rm pro${fileName}`);
                if(stderr){
                    console.log(stderr);
                    return stderr;
                }
                console.log(`the output is:${stdout}`);
                return stdout;
            });
            childProcess.stdin.write(input);
            childProcess.stdin.end();
    });
    }
//funCpp('35\n69');
module.exports={funC,funJava,funCpp};

