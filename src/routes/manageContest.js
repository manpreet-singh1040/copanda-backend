const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const Questions=require('../models/questions');
const { v4: uuidv4 } = require('uuid');
const contest = require('../models/contest');
// const contest = require('../models/contest');
// const userInfo = require('../models/userInfo');
router.get('/',async (req,res)=>{
    try{
        const { userId}=req.body;
        // const contestId=req.params.id
        let contestIdArray=await UserInfo.findOne({userId});
        let contestData=[];
        // console.log(contestIdArray);
        for(i=0;i<contestIdArray.contestModerator.length;i++)
        {
            // console.log(contestIdArray.contestModerator[i]);
            // console.log(`index  ${i} start ----------->`);
            let temp=await Contest.findOne({contestId:contestIdArray.contestModerator[i] });
            console.log(temp);
            contestData.push(temp);
        }
        // console.log(contestData);
        
        res.json({status:true,data:contestData});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});


router.get('/:id',async (req,res)=>{
    try{
        const { userId}=req.body;
        const contestId=req.params.id;
        let contestIdArray=await UserInfo.findOne({userId});
        let isModerator=false;
        for(i=0;i<contestIdArray.contestModerator.length;i++)
        {
            
            if(contestIdArray.contestModerator[i]===contestId)
            {
                isModerator=true;
                break;
            }
            // console.log(temp);
            // contestData.push(temp);
        }
        if(!isModerator)
        {
            res.status(401).json({status:false});
        }
        else
        {

            let contestData=await Contest.findOne({contestId});
            // console.log(contestIdArray);
            // console.log(contestData);
            let quesDetails=[];
        for(let i=0;i<contestData.contestQues.length;i++)
        {
            let temp=await Questions.findOne({quesId:contestData.contestQues[i]})
            quesDetails.push({quesId:temp.quesId,quesTitle:temp.quesTitle});
        }
        let newcontestData={
            contestId:contestData.contestId,
            contestName:contestData.contestName,
            contestAccess:contestData.contestAccess,
            contestStartDate:contestData.contestStartDate,
            contestEndDate:contestData.contestEndDate,
            contestCreator:contestData.contestCreator,
            contestModerator:contestData.contestModerator,
            contestQues:quesDetails
        }
            res.json({status:true,data:newcontestData});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});



router.post('/:id',async (req,res)=>{
    try{
        const { userId,contestStartDate,contestEndDate,visibility}=req.body;
        const contestId=req.params.id;
        console.log(`${userId} ${contestEndDate} ${contestStartDate} ${visibility} ${contestId}`);
        let contestIdArray=await UserInfo.findOne({userId});
        let isModerator=false;
        for(i=0;i<contestIdArray.contestModerator.length;i++)
        {
            
            if(contestIdArray.contestModerator[i]===contestId)
            {
                isModerator=true;
                break;
            }
        }
        if(!isModerator)
        {
            res.status(401).json({status:false});
        }
        else
        {

            let updatedContestList=await Contest.findOneAndUpdate(
                {contestId:contestId},
                {
                    contestStartDate,
                    contestEndDate,
                    contestAccess:visibility
                }
            )
            console.log(updatedContestList);
            res.json({status:true,data:updatedContestList});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});



router.post('/:id/addmoderator',async (req,res)=>{
    try{
        const { name}=req.body;
        const contestId=req.params.id;
        console.log(name);
        console.log(contestId);
        let userDetails=await UserInfo.findOne({name});
        for(let i=0;i<userDetails.contestModerator.length;i++)
        {
            if(userDetails.contestModerator[i]==name)
            {
                throw new Error(`user already moderator !!`);
            }
        }
        await UserInfo.updateOne(
            {name:name},
            { push$ :{contestModerator:contestId}}
        )
        console.log(`user added in moderator !`);
        await Contest.updateOne(
            {contestId:contestId},
            { push$ :{ contestModerator: contestId}}
        )
        console.log(`user added in the contests moderator db also !!`);
    res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});







module.exports=router;
