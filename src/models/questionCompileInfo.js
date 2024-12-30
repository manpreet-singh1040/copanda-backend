const mongoose=require(`mongoose`);

const compileQuestionInfoSchema=new mongoose.Schema({
    quesId:{
        type:String,
        unique:true,
        required:true,
    },
    correctCode:{
        type:String,
        required:true
    },
    testCases:{
        type:[String],
        required:true
    }
});

module.exports=mongoose.model('QuestionCompileInfo',compileQuestionInfoSchema);