require('dotenv').config();
const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const User=require("../models/users");
router.post('/',async (req,res)=>{
    let body=req.body;
    try{
        //to check if user is present in db
        let data=await User.findOne({name:body.username});
        if(data.password!== body.password)
        {
            throw new Error(`password not matched!!`);
        }
        let payload=data.userId;
        let sessionToken=jwt.sign(payload,process.env.JWTKEY);
        res.cookie("sessionToken",sessionToken,{
            httpOnly:false,
            maxAge:9000000,
            path:'/',
            secure:true,
            sameSite:'none',
            domain:'.ashleel-backend.onrender.com'
        });
        console.log(`cookie send!!`);
        res.json({status:true});
    }
    catch(err){
        console.log("invalid username and password!!");
        console.log(err);
        res.json({status:false});
    }
})

module.exports=router;