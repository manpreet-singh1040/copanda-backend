const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const Contest=require('../models/contest')

router.get('/',async (req,res)=>{
    try{
        console.log(`deleteing user ${req.body.userId}`)
        let x=await UserInfo.findOne({userId:req.body.userId});
        for(let i=0;i<x.contestModerator.length;i++)
        {
            await Contest.updateOne(
                {contestId:x.contestModerator[i]},
                {
                    $pull :{ contestModerator:x.name }
                }
            )
        }
        await User.deleteOne({userId:req.body.userId});
        await UserInfo.deleteOne({userId:req.body.userId});
        console.log(`user deleted !!`);
        res.cookie("sessionToken","",{
            httpOnly:false,
            maxAge:0,
            path:'/',
            secure:true,
            sameSite:'none',
        });
        res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});



module.exports=router;
