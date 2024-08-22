const express = require('express');
const router = express.Router();
const loginRoute=require('./login');
const authMiddleware=require('../middlewares/auth');
const execRoute=require('./exec');
const signupRoute=require('./signup');
const contestlistRouter=require('./contestlist');
const contestRoute=require('./contest');

router.use("/login",loginRoute);

//router.use("/exec",authMiddleware,execRoute); // for real
router.use('/signup',signupRoute)
router.use("/exec",execRoute); // for test only

router.use('/contestlist',contestlistRouter);
router.use('/contest',contestRoute);
router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    res.json({login:true});
})


module.exports = router