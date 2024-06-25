
const exec=require('../services/handleExecution');

const testexe=async (req,res)=>{
    const{code,input,lang,userid}=req.body;
    if(code || input || lang || userid)
        {
            let response=await exec(code,lang,userid,input);
            console.log(`the res is${response}`)
            res.json({status:true,response});
        }
    else{
        res.json({status:false,mes:`due to incomplete data!!`});
    }
};


module.exports=testexe;