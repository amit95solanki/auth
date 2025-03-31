import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import { PasswordReset } from "../models/passwordReset.js";
import { validationResult } from "express-validator";
import { sendMail } from "../helpers/mailer.js";
import randomstring from "randomstring";
import jwt from "jsonwebtoken";

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

export const forgetPassword = async (req, res) => {
  try {
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

    const userData = await User.findOne({ email });

    console.log(userData);

    if (!userData) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const randonString = randomstring.generate();
    // Construct verification link
    const verificationLink = `http://127.0.0.1:3000/reset-password?token=${randonString}`;

    const msg = `<p>Hii , ${userData?.name}! Please clicking <a href="${verificationLink}">here</a>. reset password</p>`;

    await PasswordReset.deleteMany({ user_id: userData._id });

    const passwordReset = new PasswordReset({
      user_id: userData._id,
      token: randonString,
    });
    await passwordReset.save();

    // Uncomment when mail function is ready
    // await sendMail(email, "Reset Password", msg);

    return res
      .status(200)
      .json({ success: true, msg: "Reset password link sent successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // console.log(token, password);

    const passwordResetData = await PasswordReset.findOne({ token });

    // console.log(passwordResetData);

    if (!passwordResetData) {
      return res.status(404).json({ success: false, msg: "Invalid token" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // console.log(hashPassword);

    await User.findByIdAndUpdate(
      { _id: passwordResetData.user_id },
      {
        $set: {
          password: hashPassword,
        },
      }
    );

    await PasswordReset.deleteOne({ token });

    return res
      .status(200)
      .json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const generateSccessToken = (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "12h",
  });

  return token;
};

export const userLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res
        .status(401)
        .json({ success: false, msg: "Email and password is Incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Email and password is Incorrect" });
    }

    // if(userData.is_verified === 0) {
    //   return res.status(401).json({ success: false, msg: "Email not verified" });
    // }

    const accessToken = generateSccessToken({ user: userData });

    return res.status(200).json({
      success: true,
      msg: "Login successfully",
      // user: userData,
      accessToken: accessToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const userProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      msg: "tested",
      user: req.user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
