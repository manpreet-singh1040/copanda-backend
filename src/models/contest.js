const mongoose=require('mongoose');

const contestSchema=mongoose.Schema({
    contestId:{
        type:String,
        unique:true,
        required:true,
    },
    constestName:{
        type:String,
        unique:true,
        required:true,
    },
    contestStartDate:{
        type:Date,
        required:true
    },
    contestEndDate:{
        type:Date,
        required:true
    },
    contestAuthor:{
        type:[Number],
        required:true
    },
    contestQues:{
        type:[Number],
        required:true
    }
});
module.exports=mongoose.model('Contest',contestSchema);