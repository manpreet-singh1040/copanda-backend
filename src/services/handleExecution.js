const{funC,funJava,funCpp}=require('./fileExe');
const {exec}=require('child_process');
const fs=require('fs');
const handleExecution=(code,lang,userid,input)=>{
    fs.writeFile(`${userid}.${lang}`,code,()=>{
        let output=``;
        if(lang===`c`){
            output=funC(input,userid);
        }
        else if(lang===`java`)
            {
                output=funJava(input,userid);
            }
        else if(lang===`cpp`)
            {
                output=funCpp(input,userid);
            }
        else{
            output=`errot lang parameter!!`;
        }
        exec(`rm ${userid}.${lang}`,(err,stdout,stderr)=>{
            if(err){
                console.log(err);
                return output;
            }
            if(stderr){
                console.log(err);
                return output;
            }
            console.log(`remove of the exec file successfull!!`);
            return output;
        })
    })
};


module.exports=handleExecution;