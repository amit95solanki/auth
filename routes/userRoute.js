import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";
import multer from "multer";
import {
  registorValidation,
  sendMailVelidator,
} from "../helpers/validation.js";
import {
  userRegister,
  sendMailVerification,
} from "../controllers/userController.js";

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
export default router;
