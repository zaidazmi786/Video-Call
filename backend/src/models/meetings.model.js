import mongoose, { Schema } from "mongoose";

const meetingsSchema=new Schema({
    user_id:{
        type:String,
        
    },
    meeting_code:{
        type:String,
        required:true,

    },
    date:{
      type:Date,
      default:Date.now,
      required:true,
        
    }
});

const meeting=mongoose.model("meeting",meetingsSchema);

export {meeting};