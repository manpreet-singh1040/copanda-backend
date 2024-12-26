require('dotenv/config');
require('dotenv').config();
const Redis=require('ioredis');
const redis=new Redis(process.env.REDIS_URL);
//const exec=require('../services/handleExecution');
const { v4: uuidv4 } = require('uuid');
const testexe=async (req,res)=>{
    const{code,input,lang,userid,quesId}=req.body;
    if(code || input || lang || userid)
        {
            try{
                let isCompiling=await redis.get(userid);
                if(isCompiling!==null)
                {
                    console.log(`already compiling!!<<<<<<<<<<<<<<<<<--------------------------------------`);
                    res.json({status:false,mes:"already compiling!!"});
                }
                else
                {
                    console.log(`you can countinue------------------------------------------------->>>>>>>>>>>>!!!!`);
                    await redis.set(`${userid}`,`TRUE`,`EX`,`150`);
                    console.log({code,input,lang,userid});
                    let subId=uuidv4();
                    let resp= fetch(`http://98.70.54.166:6996/`,{
                        method:`POST`,
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({code,input,lang,userid,subId,quesId})
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