const express=require('express');
const router=express.Router();
const Submissions=require('../models/submissions');
const Redis=require('ioredis');
const pollRedis=require('../../index.js');
router.post('/',async(req,res)=>{
    let response=await pollRedis.get(req.body.subId);
    if(response===null)
    {
        res.json({status:false});
    }
    else{
        response.status=true;
        res.json(response);
    }
});



router.post('/done',async(req,res)=>{
    try{

        let redis=new Redis(process.env.REDIS_URL);
        let body=JSON.stringify(req.body);
        let status=await redis.set(`${req.body.subId}`,`${body}`);
        redis.disconnect();
        if(status==="OK")
        {
            await Submissions.create({
                submissionId:req.body.submissionId,
                quesId:req.body.quesId,
                code:req.body.code,
                input:req.body.input,
                output:req.body.output,
                userId:req.body.userId,
                lang:req.body.lang
            });
            console.log(`database updated !!`);
            res.json({status:true});
        }
        else{
            res.json({status:false});
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(501);
        res.json({status:false});
    }

});

module.exports=router;