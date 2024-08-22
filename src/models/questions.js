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
    score:{
        type:Number,
        required:true
    },
    testIp:{
        type:String
    },
    testOp:{
        type:String
    }
});

module.exports=mongoose.model('Questions',questionsSchema);