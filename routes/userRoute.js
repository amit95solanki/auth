import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";
import multer from "multer";
import {
  registorValidation,
  sendMailVelidator,
  passwordResetValidator,
  loginValidator,
} from "../helpers/validation.js";
import {
  userRegister,
  sendMailVerification,
  forgetPassword,
  updatePassword,
  userLogin,
  userProfile,
} from "../controllers/userController.js";

import auth from "../middleware/auth.js";

const router = express.Router();
router.use(express.json());

// Define __dirname manually
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, "uploads");
    }
  },
  filename(req, file, cb) {
    const timestamp = Date.now();

    const extName = file.originalname.split(".").pop();
    const filename = `${timestamp}.${extName}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type is not supported"), false);
  }
};

const upload = multer({ storage: storage, fileFilter });

router.post(
  "/register",
  upload.single("image"),
  registorValidation,
  userRegister
);

router.post("/send-mail-verification", sendMailVelidator, sendMailVerification);

router.post("/forgot-password", passwordResetValidator, forgetPassword);

router.post("/update-password", updatePassword);

router.post("/login", loginValidator, userLogin);

router.get("/profile", auth, userProfile);

export default router;
