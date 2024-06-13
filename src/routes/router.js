const express = require('express');
const router = express.Router();
const loginRoute=require('./login');
const authMiddleware=require('../middlewares/auth');


router.use("/login",loginRoute);

router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    res.json({login:true});
})


module.exports = router