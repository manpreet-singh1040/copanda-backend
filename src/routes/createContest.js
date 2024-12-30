const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const { v4: uuidv4 } = require('uuid');
router.post('/',async (req,res)=>{
    try{
        const {contestName,contestAccess,contestStartDate,contestEndDate,userId} =req.body;
        let contestId=uuidv4();
        let contestCreator=await User.findOne({userId});
        console.log(`creating contest ${contestName} ${contestAccess} ${contestEndDate} ${contestStartDate} ${contestId}`);
       await Contest.create({
        contestId,
        contestName,
        contestAccess,
        contestStartDate:new Date(contestStartDate),
        contestEndDate:new Date(contestEndDate),
        contestCreator:contestCreator.name,
        contestModerator:[contestCreator.name],
        contestQues:[],
        contestAccess:"Private"
       });

       console.log(`contest added`);
       await UserInfo.updateOne(
        {userId},
        { $push: {contestModerator: contestId } }
       )
       console.log(`user info contestModerator Updated !!`);
        res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});


module.exports=router;
