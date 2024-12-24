
//const exec=require('../services/handleExecution');
const { v4: uuidv4 } = require('uuid');
const testexe=async (req,res)=>{
    const{code,input,lang,userid,quesId}=req.body;
    if(code || input || lang || userid)
        {
            try{
                console.log({code,input,lang,userid});
                let subId=uuidv4();
                let resp= fetch(`http://localhost:6996/`,{
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