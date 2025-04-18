import express from "express";
import { updatePassword } from "../controllers/userController.js";
import bodyParser from "body-parser";

const router = express.Router();
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Password update route
router.post("/update-password", updatePassword);

export default router;
