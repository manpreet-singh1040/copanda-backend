

const mongoose=require('mongoose');

const submissionSchema=mongoose.Schema({
    submissionId:{
        type:String,
        unique:true,
        required:true,
    },
    quesId:{
        type:String,
        unique:true,
        required:true,
    },
    code:{
        type:String,
        required:true
    },
    input:{
        type:String,
        required:true
    },
    output:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    lang:{
        type:String,
        required:true
    }
});
module.exports=mongoose.model('Submissions',submissionSchema);