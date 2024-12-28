const jwt=require('jsonwebtoken');
require('dotenv').config();
const auth=(req,res,next)=>{
    if(req.cookies===undefined)
        {
            res.json({login:false});
        }
    try{

        let payload=jwt.verify(req.cookies.sessionToken,process.env.JWTKEY);
        // console.log('verify successful!!');
        // console.log(payload);
        req.body.userId=payload;
        next();
    }
    catch(err){
        console.log('error in verification!!! Possible no Cookie ');
        res.json({login:false});
    }
}

module.exports=auth;