const mongoose=require(`mongoose`);

const questionsSchema=new mongoose.Schema({
    quesId:{
        type:String,
        unique:true,
        required:true,
    },
    quesTitle:{
        type:String,
        required:true,
        unique:true
    },
    quesText:{
        type:String,
        required:true,
        unique:true
    },
    difficulty:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    totalSubmission:{
        type:Number,
    },
    acceptedSubmission:{
        type:Number,
    },
    score:{
        type:Number,
        required:true
    },
    inputFormat:{
        type:String,
        required:true
    },
    outputFormat:{
        type:String,
        required:true
    },
    testIp:{
        type:String
    },
    testOp:{
        type:String
    },
    testIpExample:{
        type:String
    },
    testOpExample:{
        type:String
    },
    visibility:{
        type:Boolean,
        required:true
    }
});

module.exports=mongoose.model('Questions',questionsSchema);