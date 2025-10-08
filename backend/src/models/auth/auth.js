import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique:true
    },
    password: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    accountId:{
      type:String,
    },
    provider:{
    type:String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("auth", authSchema, "auth");
