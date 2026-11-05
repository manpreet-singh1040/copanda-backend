require('dotenv/config');
require('dotenv').config();
const Redis=require('ioredis');
const redis=new Redis(process.env.REDIS_URL);
//const exec=require('../services/handleExecution');
const { v4: uuidv4 } = require('uuid');
const queueName = 'JOB_QUEUE';
const testexe=async (req,res)=>{
    const{code,input,lang,userId,quesId}=req.body;
    let jobData,jobId;
    if(code || input || lang || userId)
        {
            jobId=uuidv4();
            jobData={code,input,lang,userId,quesId,jobId};
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
                    await redis.set(`${userId}`,`TRUE`,`EX`,`60`);
                    console.log({code,input,lang,userId,jobId});
                    const redisJobPayload= JSON.stringify(jobData);
                    // let resp= fetch(`${process.env.SERVER_2_URL}/`,{
                    //     method:`POST`,
                    //     headers:{"Content-Type":"application/json"},
                    //     body:JSON.stringify({code,input,lang,userid:userId,subId,quesId,submit:false})
                    // });
                    // if(resp.ok)
                    // {
    
                    //     let response=await resp.json();
                    //     console.log(`the res is${response}`)
                    //     res.json({status:true,outputStatus:response.status,output:response.output});
                    // }
                    // else{
                    //     res.json({status:false,mes:`err!!`});
                    // }
                    const redisQueueLength = await redis.lpush(queueName, redisJobPayload);
                    console.log(`Job added to Redis queue. Queue length: ${redisQueueLength}`);
                    res.json({status:true,submissionId:jobId,mes:`job added to queue!!`});
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