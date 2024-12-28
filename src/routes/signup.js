const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const jwt=require('jsonwebtoken');
const submissions = require('../models/submissions');
router.post('/',async(req,res)=>{
    const {username,password,email}=req.body;
    try{
        console.log(req.body);
        let userId=uuidv4();
        console.log(`database insertion start!!`);
        await User.create({
            userId,
            name:username,
            password,
            email,
            rating:0
        });
        await UserInfo.create({
            userId,
            name:username,
            email,
            rating:0,
            submissions:[],
            contestParticipated:[],
            problemsSolved:[],
            bio:"",
            image:""
        })
        console.log(`user data aaded in db!!`);
        let payload=userId;
        let sessionToken=jwt.sign(payload,process.env.JWTKEY);
        res.cookie("sessionToken",sessionToken,{
            httpOnly:false,
            maxAge:9000000,
            path:'/',
            secure:true,
            sameSite:'none'
        });
        console.log(`cookie send!!`);
        res.json({status:true});
    }
    catch(err){
        console.log(err);
        res.json({status:false});
    }

})


module.exports=router;