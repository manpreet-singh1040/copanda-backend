require('dotenv/config');
require('dotenv').config();
const express=require('express');
const router=express.Router();
const Submissions=require('../models/submissions');
const Redis=require('ioredis');
// 
const pollRedis= new Redis(process.env.REDIS_URL);

pollRedis.on('connect', () => {
    console.log('Connected to Redis');
});

pollRedis.on('error', (err) => {
    console.log('Redis connection error:', err);
});

router.post('/',async(req,res)=>{
    try{
        let response=await pollRedis.get(req.body.subId);
        console.log(`polling response for subId${req.body.subId}   ----->  ${response}`);
        if(response===null)
        {
            res.json({status:false});
        }
        else{
            res.json({response,status:true});
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500);
        res.json({status:false});
    }
});



router.post('/done',async(req,res)=>{
    try{
        console.log("request recieved in sub done!!");
        console.log(`the sub done the key name is ${req.body.subId}`);
        let redis=new Redis(process.env.REDIS_URL);
        let body=JSON.stringify(req.body);
        let status=await redis.set(`${req.body.subId}`,`${body}`,`EX`,`300`);
        console.log('op set in redis')
        redis.disconnect();
        if(status==="OK")
        {
            // await Submissions.create({
            //     submissionId:req.body.submissionId,
            //     quesId:req.body.quesId,
            //     code:req.body.code,
            //     input:req.body.input,
            //     output:req.body.output,
            //     userId:req.body.userId,
            //     lang:req.body.lang
            // });
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