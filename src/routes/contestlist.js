const express=require('express');
const router=express.Router();
const Contest=require('../models/contest');
router.get('/',async(req,res)=>{
    try{
        console.log(`in contestlist router!!`);
        let data=await Contest.find().limit(1);
        let newdata=data.map((item,index)=>{
            return {contest_id:item.contestId,
                contest_name:item.constestName,
                contest_start:item.contestStartDate,
                contest_end:item.contestEndDate,
                contest_duration:item.contestEndDate-item.contestStartDate,
                organizer:item.contestAuthor,
                no_of_problems:item.contestQues.length};
        })
        console.log(data);
        console.log(newdata);
        res.json({status:true,data:newdata});
    }
    catch(err){
        console.log(err);
        res.json({status:false});

    }
});


module.exports=router;