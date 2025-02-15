require('dotenv/config');
require('dotenv').config();
const Redis=require('ioredis');
const redis=new Redis(process.env.REDIS_URL);
//const exec=require('../services/handleExecution');
const { v4: uuidv4 } = require('uuid');
const testexe=async (req,res)=>{
    const{code,input,lang,userId,quesId}=req.body;
    if(code || input || lang || userId)
        {
            try{
                let isCompiling=await redis.get(userId);
                if(isCompiling!==null)
                {
                    console.log(`already compiling!!<<<<<<<<<<<<<<<<<--------------------------------------`);
                    res.json({status:false,mes:"already compiling!!"});
                }
                else
                {
                    console.log(`you can countinue------------------------------------------------->>>>>>>>>>>>!!!!`);
                    await redis.set(`${userId}`,`TRUE`,`EX`,`150`);
                    console.log({code,input,lang,userId});
                    let subId=uuidv4();
                    let resp= fetch(`${process.env.SERVER_2_URL}/`,{
                        method:`POST`,
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({code,input,lang,userid:userId,subId,quesId,submit:false})
                    });
                    // if(resp.ok)
                    // {
    
                    //     let response=await resp.json();
                    //     console.log(`the res is${response}`)
                    //     res.json({status:true,outputStatus:response.status,output:response.output});
                    // }
                    // else{
                    //     res.json({status:false,mes:`err!!`});
                    // }
                    res.json({status:true,submissionId:subId});
                }
            }
            catch(err){
                console.log(err);
                res.json({status:false,mes:`internal server err!!`});
            }
        }
    else{
        res.json({status:false,mes:`due to incomplete data!!`});
    }
};


module.exports=testexe;