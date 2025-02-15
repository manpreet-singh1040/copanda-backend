const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const Questions=require('../models/questions');
const QuestionCompileInfo=require('../models/questionCompileInfo');
const { v4: uuidv4 } = require('uuid');
const questions = require('../models/questions');
router.post('/forcontest',async (req,res)=>{
    try{
        const {quesTitle,quesText,difficulty,description ,score,testIp,testOp,inputFormat,outputFormat,correctCode,contestId,testIpExample,testOpExample} =req.body;
        let quesId=uuidv4();
        console.log(`contest id-->  ${contestId}`);
        console.log(`${quesTitle}  ${quesText} ${difficulty} ${description} ${score} ${inputFormat} ${outputFormat} ${correctCode} `);
        await Questions.create({
            quesId,
            quesTitle,
            quesText,
            difficulty,
            score,
            testIp,
            testOp,
            inputFormat,
            outputFormat,
            description,
            testIpExample,
            testOpExample,
            totalSubmission:0,
            acceptedSubmission:0,
            visibility:false
        })
        console.log(`question added in the db !!`);
        await QuestionCompileInfo.create({
            quesId,
            correctCode,
            testCases:[testIp]
        })
       console.log(`finally done !@!@!@@!!@!  added`);
       await Contest.updateOne(
        {contestId:contestId},
        { $push : {contestQues:quesId}}
       )
       console.log(`question added in the contest !!`);
        res.json({status:true,quesId});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});



router.post('/forpractice',async (req,res)=>{
    try{
        const {quesTitle,quesText,difficulty,description ,score,testIp,testOp,inputFormat,outputFormat,correctCode} =req.body;
        let quesId=uuidv4();
        console.log(`creating question for practice !!`);
        console.log(`${quesTitle}  ${quesText} ${difficulty} ${description} ${score} ${inputFormat} ${outputFormat} ${correctCode} `);
        await Questions.create({
            quesId,
            quesTitle,
            quesText,
            difficulty,
            score,
            testIp,
            testOp,
            inputFormat,
            outputFormat,
            description,
            totalSubmission:0,
            acceptedSubmission:0,
            visibility:true
        })
        console.log(`question added in the db !!`);
        await QuestionCompileInfo.create({
            quesId,
            correctCode,
            testCases:[testIp]
        })
       console.log(`finally done !@!@!@@!!@!  added`);
    //    await Contest.updateOne(
    //     {contestId:contestId},
    //     { $push : {contestQues:quesId}}
    //    )
    //    console.log(`question added in the contest !!`);
        res.json({status:true,quesId});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});






module.exports=router;
