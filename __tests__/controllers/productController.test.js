import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { Product } from "../../models/productModel.js";
import { User } from "../../models/userModel.js";
import productRoute from "../../routes/productRoute.js";
import { createTestUser } from "../fixtures/userFixtures.js";
import jwt from "jsonwebtoken";

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

// Mock multer middleware
jest.mock("multer", () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: "test-product-image.jpg",
        path: "uploads/products/test-product-image.jpg",
        mimetype: "image/jpeg",
      };
      next();
    },
  });
  multer.diskStorage = () => ({});
  return multer;
});

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/products", productRoute);

const testProduct = {
  name: "Test Product",
  description: "This is a test product",
  price: 99.99,
  category: "Test Category",
  stock: 10,
  image: "test-image.jpg",
};

const updatedProduct = {
  name: "Updated Product",
  description: "This is an updated test product",
  price: 199.99,
  category: "Updated Category",
  stock: 20,
};

const createTestProduct = async (Product, userId) => {
  const product = new Product({
    ...testProduct,
    image: "/uploads/products/test-image.jpg",
    createdBy: userId,
  });
  return await product.save();
};

describe("Product Controller", () => {
  let testUserId;
  let authToken;
  let testProductId;

  beforeEach(async () => {
    // Create test user
    const user = await createTestUser(User);
    testUserId = user._id;

    // Create auth token for testing
    authToken = jwt.sign(
      { user },
      process.env.ACCESS_TOKEN_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    // Create test product
    const product = await createTestProduct(Product, testUserId);
    testProductId = product._id;
  });

  describe("Create Product", () => {
    it("should create a new product", async () => {
      const response = await request(app)
        .post("/api/products/create")
        .set("Authorization", `Bearer ${authToken}`)
        .field("name", testProduct.name)
        .field("description", testProduct.description)
        .field("price", testProduct.price)
        .field("category", testProduct.category)
        .field("stock", testProduct.stock)
        .attach(
          "image",
          Buffer.from("test product image"),
          "test-product-image.jpg"
        );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "msg",
        "Product created successfully"
      );
      expect(response.body.product).toHaveProperty("name", testProduct.name);
    });

    it("should reject product creation with invalid data", async () => {
      const response = await request(app)
        .post("/api/products/create")
        .set("Authorization", `Bearer ${authToken}`)
        .field("name", "") // Missing required name
        .field("description", testProduct.description)
        .field("price", testProduct.price)
        .field("category", testProduct.category)
        .field("stock", testProduct.stock)
        .attach(
          "image",
          Buffer.from("test product image"),
          "test-product-image.jpg"
        );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("msg", "Validation errors");
    });
  });

  describe("Get Products", () => {
    it("should get all products with pagination", async () => {
      // Create a few more products for pagination testing
      await createTestProduct(Product, testUserId);
      await createTestProduct(Product, testUserId);

      const response = await request(app)
        .get("/api/products")
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("products");
      expect(response.body.products.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("currentPage", 1);
    });

    it("should get a single product by ID", async () => {
      const response = await request(app).get(`/api/products/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.product).toHaveProperty(
        "_id",
        testProductId.toString()
      );
      expect(response.body.product).toHaveProperty("name", testProduct.name);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("msg", "Product not found");
    });

    it("should search products by query", async () => {
      // Create a product with unique name for search testing
      const searchProduct = new Product({
        name: "Unique Searchable Item",
        description: "Easy to find",
        price: 50,
        category: "Searchable",
        stock: 5,
        image: "/uploads/products/test-image.jpg",
        createdBy: testUserId,
      });
      await searchProduct.save();

      const response = await request(app)
        .get("/api/products")
        .query({ search: "Unique" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(
        response.body.products.some((p) => p.name === "Unique Searchable Item")
      ).toBeTruthy();
    });
  });

  describe("Update Product", () => {
    it("should update an existing product", async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .field("name", updatedProduct.name)
        .field("description", updatedProduct.description)
        .field("price", updatedProduct.price)
        .field("category", updatedProduct.category)
        .field("stock", updatedProduct.stock);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "msg",
        "Product updated successfully"
      );
      expect(response.body.product).toHaveProperty("name", updatedProduct.name);
    });

    it("should reject update with invalid data", async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .field("price", -100); // Invalid price (negative)

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should return 404 for updating non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .field("name", updatedProduct.name);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("msg", "Product not found");
    });
  });

  describe("Delete Product", () => {
    it("should delete an existing product", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "msg",
        "Product deleted successfully"
      );

      // Verify product is deleted
      const deletedProduct = await Product.findById(testProductId);
      expect(deletedProduct).toBeFalsy();
    });

    it("should return 404 for deleting non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("msg", "Product not found");
    });
  });
});
