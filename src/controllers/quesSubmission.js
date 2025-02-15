require('dotenv/config');
require('dotenv').config();
const Redis=require('ioredis');
const redis=new Redis(process.env.REDIS_URL);
//const exec=require('../services/handleExecution');
const { v4: uuidv4 } = require('uuid');
const Questions=require('../models/questions');
const quesSubmission=async (req,res)=>{
    const{code,lang,userId,quesId}=req.body;
    let ip=await Questions.findOne({quesId:quesId});
    let input=ip.testIp;
    console.log(`code --> ${code} lang-->${lang}  userId--->${userId} input--->${input} quesId-->${quesId}`);
    console.log((code || lang || userId || input));
    input=(input) ? input :"";
    if((code || lang || userId || input))
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
                    await redis.set(`${userId}`,`FALSE`,`EX`,`150`);
                    console.log({code,input,lang,userId});
                    let subId=uuidv4();
                    let resp= fetch(`${process.env.SERVER_2_URL}/`,{
                        method:`POST`,
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({code,input,lang,userid:userId,subId,quesId,submit:true})
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


module.exports=quesSubmission;