const mongoose=require('mongoose');

const userInfoSchema=mongoose.Schema({
    userId:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        unique:true,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    submissions:{
        type:[String],
    },
    contestParticipated:{
        type:[String]
    },
    problemsSolved:{
        type:[String],
    },
    bio:{
        type:String
    },
    image:{
        type:String
    }
});

module.exports=mongoose.model('UserInfo',userInfoSchema);
