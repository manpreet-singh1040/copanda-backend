const express=require('express');
const router=express.Router();
const Questions=require('../models/questions');
// const QuestionCompileInfo=require('../models/questionCompileInfo');
// const { v4: uuidv4 } = require('uuid');

router.get('/',async (req,res)=>{
    try{
        const resp = await Questions.findAll({
            where: { visibility: true },
            raw: true // Ensures you get plain JSON objects
          });
        res.send(resp);
    }
    catch(err){
        console.log(err);
        res.status(500).json({status:false});
    }
});


module.exports=router;
