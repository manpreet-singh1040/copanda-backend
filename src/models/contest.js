const mongoose=require('mongoose');

const contestSchema=mongoose.Schema({
    contestId:{
        type:String,
        unique:true,
        required:true,
    },
    contestName:{
        type:String,
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
    contestCreator:{
        type:String,
        required:true
    },
    contestModerator:{
        type:[{type:String}],
        required:true
    },
    contestQues:{
        type:[{type:String}]
    },
    contestAccess:{
        type:String,
        required:true
    }
});
module.exports=mongoose.model('Contest',contestSchema);