const {exec}=require('child_process');
const funC=(input)=>{
exec("gcc test.c -o pro",(err,stdout,stderr)=>{
    if(err)
        {
            console.log(`err in compilation!`);
            console.log(err);
            return;
        }
        if(stderr){
            console.log(`error output!!`);
            console.log(stderr);
            return;
        }
        const childProcess=exec("./pro",(err,stdout,stderr)=>{
            if(err){
                console.log(err);
                return;
            }
            if(stderr){
                console.log(stderr);
                return;
            }
            console.log(`the output is:${stdout}`);
        });
        childProcess.stdin.write(input);
        childProcess.stdin.end();
});
}
//fun();
const funJava = (input) => {
    const childProcess = exec("java test2.java");

    childProcess.stdin.write(input);
    childProcess.stdin.end();

    childProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Child process exited with code ${code}`);
        }
    });
};

//funJava('32\n45');

const funCpp=(input)=>{
    exec("g++ test3.cpp -o pro",(err,stdout,stderr)=>{
        if(err)
            {
                console.log(`err in compilation!`);
                console.log(err);
                return;
            }
            if(stderr){
                console.log(`error output!!`);
                console.log(stderr);
                return;
            }
            const childProcess=exec("./pro",(err,stdout,stderr)=>{
                if(err){
                    console.log(err);
                    return;
                }
                if(stderr){
                    console.log(stderr);
                    return;
                }
                console.log(`the output is:${stdout}`);
            });
            childProcess.stdin.write(input);
            childProcess.stdin.end();
    });
    }
funCpp('35\n69');
module.exports={funC,funJava,funCpp};

