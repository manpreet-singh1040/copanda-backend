const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');


router.get('/',async (req,res)=>{
    try{
        console.log(`logging out  user ${req.body.userId}`)
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
