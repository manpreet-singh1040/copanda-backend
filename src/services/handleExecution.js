const code=`#include <stdio.h>

int main() {
    int num1, num2;

    // Taking two numbers as input from the user
    printf("Enter first number: ");
    scanf("%d", &num1);

    printf("Enter second number: ");
    scanf("%d", &num2);

    // Displaying the entered numbers
    printf("You entered: %d and %d\\n", num1, num2);

    // Printing numbers from 1 to 4
    printf("Numbers from 1 to 4:\\n");
    for (int i = 1; i <= 4; i++) {
        printf("%d\\n", i);
    }

    return 0;
}
`;
const lang=`c`;
const input=`35\n65`;
const userid=`1234`;



const { resolve } = require('path');
const{funC,funJava,funCpp}=require('./fileExe');
//const {exec}=require('child_process');
const fs=require('fs');
const handleExecution= (code,lang,userid,input)=>{

    return new Promise(async(resolve,reject)=>{

        fs.writeFileSync(`${userid}.${lang}`,code);
    console.log('file is written!!');
    if(lang===`c`){
        //console.log(`inside it!!`);
        let q=await funC(input,userid)
        console.log(`the op is this:\n${q}`)
        resolve(q.replace(/\+/g, ''));
    }
    else if(lang===`java`)
        {
            resolve(await funJava(input,userid));
        }
    else if(lang===`cpp`)
        {
            resolve(await funCpp(input,userid));
        }
    else{
        reject(`errot lang parameter!!`);
    }
    /*exec(`rm ${userid}.${lang}`,(err,stdout,stderr)=>{
        if(err){
            console.log(err);
            return output;
        }
        if(stderr){
            console.log(err);
            return output;
        }
        console.log(`remove of the exec file successfull!!`);
        })*/
       //return output;

})
}

//handleExecution(code,lang,userid,input);

module.exports=handleExecution;