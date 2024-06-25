const express = require('express');
const router = express.Router();
const loginRoute=require('./login');
const authMiddleware=require('../middlewares/auth');
const testexecRoute=require('./testexe');

router.use("/login",loginRoute);

//router.use("/testexe",authMiddleware,testexecRoute); // for real

router.use("/testexe",testexecRoute); // for test only
router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    res.json({login:true});
})


module.exports = router