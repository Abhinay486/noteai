import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    notes: [
        {
          title: { type: String, required: true },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now }
        }
      ]
      
}, 
{
    timestamps : true,
}
);

export const User = mongoose.model("User", schema);