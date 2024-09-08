require('dotenv').config();
const crypto=require('crypto')
const express=require('express');
const router=express.Router();
const User=require("../models/users");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const jwt=require('jsonwebtoken');

const NotTell='1f51492e6e20f46c8c3d6a4ff212dfed26a13b97'
const cliendId='Ov23liRrBdzWSwEQIauD'
async function getUserInfo(accessToken) {
    try {
      // Fetch user information from GitHub
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
  
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
  
      // The response contains an array of email addresses
      const emails = emailResponse.data;
      // Find the primary email (or handle according to your needs)
      const primaryEmail = emails.find(email => email.primary).email;
  
      // Extract GitHub handle from user information
      const githubHandle = userResponse.data.login;
  
      return {
        email: primaryEmail,
        githubHandle: githubHandle,
      };
    } catch (error) {
      console.error('Error fetching user information from GitHub:', error);
      return {
        email: null,
        githubHandle: null,
      };
    }
  }
router.get('/callback', async (req,resp)=>{
    const token=req.params.token;
    const tokenResponse = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token`,
        headers: {
          accept: 'application/json',
        },
        data: {
          client_id: cliendId,
          client_secret: NotTell,
          code: token,
        },
      });
    const accessToken = tokenResponse.data.access_token;
    resp.send({token:accessToken});

})

router.post('/login',async (req,resp)=>{
    const code=req.body.email;
    const userInfo=await getUserInfo(code);
    const data=User.findOne({email:userInfo.email});
    try{
        if(data){
            let payload=data.userId;
            let sessionToken=jwt.sign(payload,process.env.JWTKEY);
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
        else{
            let password=crypto.randomBytes(16).toString('hex');
            let email=userInfo.email;
            let handle=userInfo.githubHandle
            let userId=uuidv4();
            await User.create({
                userId,
                name:handle,
                password,
                email,
                rating:0
            });
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
    }
    catch(err){
        console.log(err);
        res.json({status:false});
    }

    


})