import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  productValidation,
  updateProductValidation,
} from "../helpers/productValidation.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.use(express.json());

// Create uploads/products directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
const productsDir = path.join(uploadDir, "products");

// Ensure both directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir);
}

// Configure multer storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, productsDir); // Use the absolute path from productsDir
    }
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const extName = file.originalname.split(".").pop();
    const filename = `product_${timestamp}.${extName}`;
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
    cb(new Error("Only .png, .jpg and .jpeg formats are allowed"), false);
  }
};

const upload = multer({ storage: storage, fileFilter });

// Product routes
router.post(
  "/create",
  //   auth,
  upload.single("image"),
  productValidation,
  createProduct
);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  // auth,
  upload.single("image"),
  updateProductValidation,
  updateProduct
);
router.delete("/:id", auth, deleteProduct);

export default router;
