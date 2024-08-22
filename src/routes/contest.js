const express=require('express');
const router=express.Router();
const Contest=require('../models/contest');
const Question=require('../models/questions');
router.get('/:id',async(req,res)=>{
    try{
        console.log(`in contest router!!`);
        console.log(req.params);
        let max_score=0;
        let contestId=req.params.id;
        let data=await Contest.find({contestId});
        data=data[0];
        //console.log(data);
        let questions=await Promise.all(data.contestQues.map(async(item,index)=>{
            try{
                let ques=await Question.find({quesId:item});
                return {id:ques[0].quesId,
                    question_title: ques[0].quesTitle,
                    question_text: ques[0].quesText,
                    difficulty: ques[0].difficulty,
                    score: ques[0].score,
                    description: ques[0].description,
                    example_input: ques[0].testIp,
                    example_output: ques[0].testOp}
                //return ques[0];
            }
            catch(err){
                console.log('inner loop!!');
                console.log(err);
            }
        })) 
        questions.forEach(element => {
            max_score=max_score+element.score;
        });
        const newdata={
            contest_id:data.contestId,
            start_time:data.contestStartDate,
            end_time:data.contestEndDate,
            max_score,
            questions,
            total_questions:data.contestQues.length
        };
        console.log(newdata);
        res.json({status:true,data:newdata})
    }
    catch(err){
        console.log(err);
        res.json({status:false});

    }
});


module.exports=router;