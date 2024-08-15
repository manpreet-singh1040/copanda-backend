
const express=require('express');
const router=express.Router();


const testexeController=require('../controllers/exec');
router.post('/',testexeController);

module.exports=router;