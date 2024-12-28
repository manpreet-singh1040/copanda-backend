const express=require('express');
const router=express.Router();
const User=require('../models/users');
const UserInfo=require('../models/userInfo');
const questions=require('../models/questions');
const submissions=require('../models/submissions');

router.get('/',async (req,res)=>{
    try{
        console.log(`inside userInfo !!  ${req.body.userId}`)
        let userInfo=await UserInfo.findOne({userId:req.body.userId});
        // console.log(`found user info ${userInfo}`);
        let solvedQ=userInfo.problemsSolved;
        let easy=0;
        let medium=0;
        let hard=0;
        for(let i of solvedQ)
        {
            let quesDetail=await questions.findOne({quesId:i});
            if(quesDetail.difficulty==="Medium")
            {
                medium++;
            }
            else if(quesDetail.difficulty==="Hard")
            {
                hard++;
            }
            else{
                easy++;
            }
        }
        let questionDetail={easy,medium,hard};

        response={name:userInfo.name,
            email:userInfo.email,
            rating:userInfo.rating,
            submissions:userInfo.submissions,
            contestParticipated:userInfo.contestParticipated,
            problemsSolved:userInfo.problemsSolved,
            bio:userInfo.bio,
            questionDetail};
        console.log(response);

        res.json({status:true,userInfo:response});
    }
    catch(err){
        console.log(err);

        res.status(500).json({status:false});
    }
});


module.exports=router;
