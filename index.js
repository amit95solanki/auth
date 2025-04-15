import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.use("/", authRoute);
app.use("/api/products", productRoute);

app.listen(port, function () {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
