import { Product } from "../models/productModel.js";
import { validationResult } from "express-validator";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, description, price, category, stock } = req.body;

    // Create new product with proper image path
    const imagePath = `/uploads/${req.file.filename}`;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      //   createdBy: req.user.user._id,
      image: imagePath,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      msg: "Product created successfully",
      product: savedProduct,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Failed to create product",
      error: err.message,
    });
  }
};

// Get all products with pagination and search
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipCount = (page - 1) * limit;

    const searchQuery = req.query.search || "";

    // Build query based on search parameter
    let query = {};

    if (searchQuery) {
      // Use text search if available
      if (searchQuery.length > 0) {
        query = {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
          ],
        };
      }
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch products",
      error: err.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch product",
      error: err.message,
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Validation errors",
        errors: errors.array(),
      });
    }

    const productId = req.params.id;
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    // For testing, disable the authorization check
    // Comment out or modify the authorization check
    /*
    // Check if user is the creator of the product
    if (product.createdBy.toString() !== req.user.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to update this product",
      });
    }
    */

    // Update with proper image path
    const imagePath = req.file
      ? `/uploads/products/${req.file.filename}`
      : product.image;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        category: category || product.category,
        stock: stock || product.stock,
        image: imagePath,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Failed to update product",
      error: err.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    // For testing, disable the authorization check
    // Comment out or modify the authorization check
    /*
    // Check if user is the creator of the product
    if (product.createdBy.toString() !== req.user.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Not authorized to delete this product",
      });
    }
    */

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      msg: "Product deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Failed to delete product",
      error: err.message,
    });
  }
};
