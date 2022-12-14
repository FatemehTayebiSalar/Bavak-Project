const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        lowercase:true
    },
    password: {
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    otp:{
        type: Object ,
        default: {
            code:0,
            expires:0
        }
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    
    role:{
        type:String,
        default:"USER"
    },
    //bills :{
    //    type : [],
    //    default:[]
    //},

    joinedEvents:{
        type : [mongoose.Types.ObjectId],
        ref : "event",
        default:[]    
            
    }
    ,

    joinedPodcasts:{
        type : [mongoose.Types.ObjectId],
        ref : "podcast",
        default:[]   
            
    },

    joinedVideos:{
        type : [mongoose.Types.ObjectId],
        ref : "video",
        default:[]      
            
    }
    
});

UserSchema.index({firstName:"text" , lastName : "text" , mobile :"text" , email : "text"})

module.exports = {
    UserModel : mongoose.model("user",UserSchema)
}