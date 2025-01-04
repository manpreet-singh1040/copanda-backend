const express = require('express');
const router = express.Router();
const loginRoute=require('./login');
const authMiddleware=require('../middlewares/auth');
const execRoute=require('./exec');
const signupRoute=require('./signup');
const contestlistRouter=require('./contestlist');
const contestRoute=require('./contest');
const github_Outh=require('./github-auth');
const submissionRoute=require('./submission');
const userDeleteRoute=require('./deleteUser');
const userInfoRoute=require('./userInfo');
const createContestRouter=require('./createContest');
const manageContestRouter=require('./manageContest');
const createQuestionRouter=require('./createQuestion');
const problemRouter=require('./problem');
const logoutRouter=require('./logout');


router.use('/logout',logoutRouter);
router.use('/problem',problemRouter);
router.use('/createquestion',createQuestionRouter); //for test in real use auth
router.use('/managecontest',authMiddleware,manageContestRouter);
router.use('/createcontest',authMiddleware,createContestRouter);
router.use("/submission",submissionRoute);
router.use("/login",loginRoute);
router.use("/github",github_Outh);
router.use("/exec",authMiddleware,execRoute); // for real
router.use('/signup',signupRoute)
// router.use("/exec",execRoute); // for test only    
router.use('/deleteuser',authMiddleware,userDeleteRoute);
router.use('/userinfo',authMiddleware,userInfoRoute);
router.use('/contestlist',authMiddleware,contestlistRouter);
router.use('/contest',contestRoute);
router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    // setTimeout(()=>{res.json({login:true});},5000)
    res.json({login:true});
})


module.exports = router