
const express=require('express');
const router=express.Router();


const testexeController=require('../controllers/exec');
const submitController=require('../controllers/quesSubmission');
router.post('/',testexeController);
router.post('/submit',submitController);

module.exports=router;