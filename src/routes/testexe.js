
const express=require('express');
const router=express.Router();


const testexeController=require('../controllers/testexe');
router.post('/',testexeController);

module.exports=router;