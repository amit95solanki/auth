import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import { validationResult } from "express-validator";
import { sendMail } from "../helpers/mailer.js";
export const userRegister = async (req, res) => {
  try {
    const error = validationResult(req);

    if (error.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, msg: "Errors ", errors: error.array() });
    }
    const { name, email, mobile, password } = req.body;

    const isExists = await User.findOne({ email });

    console.log(name, email, mobile, password);

    if (isExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);

    const user = new User({
      name,
      email,
      mobile,
      password: hashPassword,
      is_verified: 0,
      image: "image/" + req.file.path,
    });
    const userdata = await user.save();
    let msg = `<p>Congratulations! ${name} You have successfully registered at Amit Solanki application. Welcome to the Macho Man community!</p>`;
    // sendMail(email, "Registration Successfull", msg);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const mailVerification = async (req, res) => {
  try {
    if (req.query.id === undefined) {
      return res.render("404");
    }

    const userData = await User.findOne({ _id: req.query.id });

    if (userData) {
      if (userData.is_verified === 1) {
        return res.render("mail-verification", {
          message: "mail already verified",
        });
      }
      await User.findById(
        { _id: req.query.id },
        {
          $set: {
            is_verified: 1,
          },
        }
      );
      return res.render("mail-verification", {
        message: "mail verified successfully",
      });
    } else {
      return res.render("mail-verification", {
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const sendMailVerification = async (req, res) => {
  try {
    // // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }

    // Extract email from request body
    const { email } = req.body;
    console.log("Received email:", email);

    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    // Find user in database
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Check if the email is already verified
    if (userData.is_verified === 1) {
      return res
        .status(400)
        .json({ success: false, msg: "Email already verified" });
    }

    // Construct verification link
    const verificationLink = `http://127.0.0.1:3000/mail-verification`;

    const msg = `<p>Congratulations, ${userData?.name}! Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`;

    // Uncomment when mail function is ready
    // await sendMail(email, "Registration Successful", msg);

    return res
      .status(200)
      .json({ success: true, msg: "Verification link sent successfully" });
  } catch (err) {
    console.error("Error in sendMailVerification:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: err.message,
    });
  }
};
