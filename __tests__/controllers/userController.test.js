import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Add this import
import { User } from "../../models/userModel.js";
import { PasswordReset } from "../../models/passwordReset.js";
import userRoute from "../../routes/userRoute.js";
import authRoute from "../../routes/authRoute.js";
import jwt from "jsonwebtoken";

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

// Mock multer middleware
jest.mock("multer", () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: "test-image.jpg",
        path: "uploads/test-image.jpg",
        mimetype: "image/jpeg",
      };
      next();
    },
  });
  multer.diskStorage = () => ({});
  return multer;
});

// Mock sendMail function
jest.mock("../../helpers/mailer.js", () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api", userRoute);
app.use("/", authRoute);

const testUser = {
  name: "Test User",
  email: "test@example.com",
  mobile: "1234567890",
  password: "Test@123",
  image: "test-image.jpg",
};

const loginCredentials = {
  email: "test@example.com",
  password: "Test@123",
};

const createTestUser = async (User) => {
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  const user = new User({
    name: testUser.name,
    email: testUser.email,
    mobile: testUser.mobile,
    password: hashedPassword,
    is_verified: 1,
    image: "image/test-image.jpg",
  });
  return await user.save();
};

describe("User Controller", () => {
  let testUserId;
  let authToken;

  beforeEach(async () => {
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
  });

  describe("User Registration", () => {
    it("should register a new user", async () => {
      const newUser = {
        name: "New User",
        email: "new@example.com",
        mobile: "9876543210",
        password: "NewPass@123",
      };

      const response = await request(app)
        .post("/api/register")
        .field("name", newUser.name)
        .field("email", newUser.email)
        .field("mobile", newUser.mobile)
        .field("password", newUser.password)
        .attach("image", Buffer.from("test image content"), "test-image.jpg");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
    });

    it("should return error for existing user", async () => {
      const response = await request(app)
        .post("/api/register")
        .field("name", testUser.name)
        .field("email", testUser.email)
        .field("mobile", testUser.mobile)
        .field("password", testUser.password)
        .attach("image", Buffer.from("test image content"), "test-image.jpg");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "User already exists");
    });
  });

  describe("User Login", () => {
    it("should login user with valid credentials", async () => {
      const response = await request(app)
        .post("/api/login")
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("msg", "Login successfully");
      expect(response.body).toHaveProperty("accessToken");
    });

    it("should reject login with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ email: loginCredentials.email, password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty(
        "msg",
        "Email and password is Incorrect"
      );
    });
  });

  describe("Password Reset Flow", () => {
    it("should send forget password email", async () => {
      const response = await request(app)
        .post("/api/forgot-password")
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "msg",
        "Reset password link sent successfully"
      );

      // Verify token was created in database
      const resetToken = await PasswordReset.findOne({ user_id: testUserId });
      expect(resetToken).toBeTruthy();
    });

    it("should update password with valid token", async () => {
      // First create a reset token
      const token = "test-reset-token";
      const passwordReset = new PasswordReset({
        user_id: testUserId,
        token: token,
      });
      await passwordReset.save();

      // Update password
      const response = await request(app).post("/update-password").send({
        token: token,
        password: "NewPassword@123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "msg",
        "Password updated successfully"
      );

      // Verify token was deleted
      const resetTokenAfter = await PasswordReset.findOne({ token });
      expect(resetTokenAfter).toBeFalsy();

      // Verify we can login with new password
      const loginResponse = await request(app).post("/api/login").send({
        email: testUser.email,
        password: "NewPassword@123",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty("success", true);
    });
  });

  describe("User Profile", () => {
    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("user");
    });

    it("should reject profile request without token", async () => {
      const response = await request(app).get("/api/profile");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("msg", "Token is required");
    });
  });
});
