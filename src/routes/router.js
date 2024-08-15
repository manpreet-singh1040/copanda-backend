const express = require('express');
const router = express.Router();
const loginRoute=require('./login');
const authMiddleware=require('../middlewares/auth');
const execRoute=require('./exec');
const signupRoute=require('./signup');
router.use("/login",loginRoute);

//router.use("/exec",authMiddleware,execRoute); // for real
router.use('/signup',signupRoute)
router.use("/exec",execRoute); // for test only
router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    res.json({login:true});
})


module.exports = router