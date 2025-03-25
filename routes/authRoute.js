import express from "express";
import { userRegister } from "../controllers/userController.js";
const router = express.Router();
router.use(express.json());

export default router;
