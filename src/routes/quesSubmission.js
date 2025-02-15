require('dotenv/config');
require('dotenv').config();
const express=require('express');
const router=express.Router();
const Submissions=require('../models/submissions');
const Redis=require('ioredis');
const authMiddleware=require('../middlewares/auth');
const pollRedis= new Redis(process.env.REDIS_URL);
const Questions=require('../models/questions');
const UserInfo=require('../models/userInfo');
const submissions = require('../models/submissions');
pollRedis.on('connect', () => {
    console.log('Connected to Redis');
});

pollRedis.on('error', (err) => {
    console.log('Redis connection error:', err);
});

router.post('/',authMiddleware,async(req,res)=>{
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
        console.log("request recieved in submission of submit is done!!");
        console.log(`the sub done the key name is ${req.body.subId}`);
        console.log(`the result from server-2 is ${req.body}`);
        let redis=new Redis(process.env.REDIS_URL);
        let body=JSON.stringify(req.body);
        let top= await Questions.findOne({quesId:req.body.quesId});
        let testOp=top.testOp;
        let status=(testOp===req.body.output.op);
        console.log(`testop---> ${testOp}  output--->${req.body.output}`);
        console.log(status);
        if(testOp===req.body.output.op){
            let status=await redis.set(`${req.body.subId}`,`${JSON.stringify({ output : {op:"Successful submission all test cases passed"}})}`,`EX`,`150`);
        }
        else{
            let status=await redis.set(`${req.body.subId}`,`${JSON.stringify({ output : {op:"wrong submission  test cases failed"}})}`,`EX`,`150`);
        }
        await redis.del(req.body.userId);
        console.log('op set in redis');
        redis.disconnect();
        if(status)
        {
            let curStatus=await Questions.findOne({quesId:req.body.quesId});
            await Questions.updateOne(
                {quesId:req.body.quesId},
                {
                    $inc: {
                        totalSubmission: 1,
                        acceptedSubmission: 1
                      }
                }
            );
            let userInfoCurStatus=await UserInfo.findOne({userId:req.body.userId});
            await UserInfo.updateOne(
                {userId:req.body.userId},
                {
                    $push:{ submissions:req.body.subId },
                    $addToSet: { problemsSolved: req.body.quesId },
                    $inc:{
                        rating: curStatus.score
                    }
                }
            );
            res.json({status:true});
        }
        else{
            let curStatus=await Questions.findOne({quesId:req.body.quesId});
            await Questions.updateOne(
                {quesId:req.body.quesId},
                {
                    $inc: {
                        totalSubmission: 1
                    }
                }
            );
            let userInfoCurStatus=await UserInfo.findOne({userId:req.body.userId});
            await UserInfo.updateOne(
                {userId:req.body.userId},
                {
                    $push:{ submissions:req.body.subId }
                }
            );
            res.json({status:false});
        }
        console.log(`database updated !!`);
        await Submissions.create({
            submissionId:req.body.subId,
            quesId:req.body.quesId,
            code:req.body.code,
            output:req.body.output.op,
            lang:req.body.lang,
            userId:req.body.userId
        });
        console.log(`submission updated !!`);
    }
    catch(err)
    {
        console.log(err);
        res.status(501);
        res.json({status:false});
    }

});

module.exports=router;