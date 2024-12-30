const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const { v4: uuidv4 } = require('uuid');
const contest = require('../models/contest');
// const userInfo = require('../models/userInfo');
router.get('/',async (req,res)=>{
    try{
        const { userId}=req.body;
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


router.post('/:id',async(req,res)=>{
    const {id} =req.params;
    const {body}=req.params;
});


module.exports=router;
