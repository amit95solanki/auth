import mongoose, { model } from "mongoose";

const passwordResetSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
});

export const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);
