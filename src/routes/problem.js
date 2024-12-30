const express=require('express');
const router=express.Router();
const Contest=require('../models/contest');
const Question=require('../models/questions');

router.get('/:id',async(req,res)=>{
    try{
        console.log(`in problem router!!`);
        console.log(req.params);
        const{id}=req.params;
        let newdata=await Question.findOne({quesId:id});
        res.json({status:true,quesDetail:newdata})
    }
    catch(err){
        console.log(err);
        res.json({status:false});

    }
});


module.exports=router;