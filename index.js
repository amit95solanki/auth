import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

const connectDb = () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      dbName: "auth",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};
const port = 3000;

app.use("/api", userRoute);
// app.use("/", authRoute);

app.listen(port, function () {
  console.log(`Server is running on http://localhost:3000${port}`);
  connectDb();
});
