const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
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
    password:{
        type:String,
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
    }
});

module.exports=mongoose.model('User',userSchema);
