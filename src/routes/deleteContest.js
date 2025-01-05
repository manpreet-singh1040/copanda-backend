const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest');
const { v4: uuidv4 } = require('uuid');
router.post('/:id',async (req,res)=>{
    try{
        const {userId} =req.body;
        console.log(`deleting contestuser id -----> ${userId}`);
        const contestId=req.params.id;
        const userInfo=await UserInfo.findOne({userId:userId});
        if(!userInfo.contestModerator.includes(contestId))
        {
            res.status(403).json({status:false});
            throw new Error(`not authorized user`);
        }
        else{
            let contestDetails=await Contest.findOne({contestId:contestId});
            for( i in contestDetails.contestModerator)
            {
                await UserInfo.updateOne(
                    {userId:contestDetails.contestModerator[i]},
                    { $pull : {contestModerator : contestId} }
                )
            }
            await Contest.deleteOne({contestId:contestId});
            res.json({status:true});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});


module.exports=router;
