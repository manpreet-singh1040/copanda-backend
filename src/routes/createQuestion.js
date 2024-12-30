const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const Questions=require('../models/questions');
const QuestionCompileInfo=require('../models/questionCompileInfo');
const { v4: uuidv4 } = require('uuid');
router.post('/',async (req,res)=>{
    try{
        const {quesTitle,quesText,difficulty,description ,score,testIp,testOp,inputFormat,outputFormat,correctCode} =req.body;
        let quesId=uuidv4();
        console.log(`${quesTitle}  ${quesText} ${difficulty} ${description} ${score} ${inputFormat} ${outputFormat} ${correctCode} `);
        await Questions.create({
            quesId,
            quesTitle,
            quesText,
            difficulty,
            description,
            score,
            testIp,
            testOp,
            inputFormat,
            outputFormat
        })
        console.log(`question added in the db !!`);
        await QuestionCompileInfo.create({
            quesId,
            correctCode,
            testCases:[testIp]
        })
       console.log(`finally done !@!@!@@!!@!  added`);
       
        res.json({status:true,quesId});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});


module.exports=router;
