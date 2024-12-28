const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');


router.get('/',async (req,res)=>{
    try{
        console.log(`deleteing user ${req.body.userId}`)
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
        res.status(500).json({status:false});
    }
});


module.exports=router;
