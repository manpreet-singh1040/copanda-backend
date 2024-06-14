import express from 'express'
import LoginRouter from './login.js';
import authMiddleware from "../middlewares/auth.js"

const router = express.Router();

router.use("/login",LoginRouter);

router.get("/", (req, res) => {
    res.send('Hello World!')
})
router.get('/checklogin',authMiddleware,(req,res)=>{
    res.json({login:true});
})


export default router