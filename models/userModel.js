import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_verified: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    default: 0, //1 for verified, 0 for not verified
  },
});

export const User = mongoose.model("User", userSchema);
