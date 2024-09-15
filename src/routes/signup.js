const express=require('express');
const router=express.Router();
const User=require('../models/users');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const {sendMail,signupInitiation} = require('../services/email-auth')
const jwt=require('jsonwebtoken');
router.post('/',async(req,res)=>{
    const {username,password,email,name}=req.body;
    try{
        console.log(req.body);
        let userId=uuidv4();
        console.log(`database insertion start!!`);
        await User.create({
            userId,
            name:username,
            tempPassword:password,
            email,
            rating:0
        });
        console.log(`user data aaded in db!!`);
        await signupInitiation(id=userId,name=name);
        
        let payload=userId;
        // let sessionToken=jwt.sign(payload,process.env.JWTKEY);
        // res.cookie("sessionToken",sessionToken,{
        //     httpOnly:false,
        //     maxAge:9000000,
        //     path:'/',
        //     secure:true,
        //     sameSite:'none'
        // });
        // console.log(`cookie send!!`);
        res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.json({status:false});
    }

})
router.post("/verify",async (req,resp)=>{
    const code=req.body.code;
    
    
    try{
        let time=code.slice(-13);
        let id=code.slice(0,-13);
        let user = await User.findOne({userId:id});
        let updatedUser = await User.findOneAndUpdate(
            { userId: id }, // Query to find the document
            { $set: { password:user.tempPassword } }, // Update operations
            { new: true } // Option to return the updated document
        );
        if(user.tempPassword==updatedUser.password){
            let sessionToken=jwt.sign(id,process.env.JWTKEY);
            resp.cookie("sessionToken",sessionToken,{
                httpOnly:false,
                maxAge:9000000,
                path:'/',
                secure:true,
                sameSite:'none'
            });
            console.log(`cookie send!!`);
            resp.json({status:true});
        }
    }catch(error){
        console.log("Verification Failed");
        resp.json({status:false})
    }

})
    




module.exports=router;