const jwt=require('jsonwebtoken');

const auth=(req,res,next)=>{
    if(req.cookies===undefined)
        {
            res.json({login:false});
        }
    try{

        let payload=jwt.verify(req.cookies.sessionToken,"jwtkey");
        console.log('verify successful!!');
        console.log(payload);
        next();
    }
    catch(err){
        console.log('error in verification!!!');
        console.log(err);
        res.json({login:false});
    }
}

module.exports=auth;