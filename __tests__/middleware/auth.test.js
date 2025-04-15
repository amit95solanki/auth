import jwt from "jsonwebtoken";
import verifyToken from "../../middleware/auth.js";
import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt"; // Add the import

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

const createTestUser = async (User) => {
  const hashedPassword = await bcrypt.hash("Test@123", 10);
  const user = new User({
    name: "Test User",
    email: "test@example.com",
    mobile: "1234567890",
    password: hashedPassword,
    is_verified: 1,
    image: "image/test-image.jpg",
  });
  return await user.save();
};

describe("Auth Middleware", () => {
  let testUser;
  let validToken;
  let expiredToken;

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser(User);

    // Generate valid token
    validToken = jwt.sign(
      { user: testUser },
      process.env.ACCESS_TOKEN_SECRET || "test-secret",
      {
        expiresIn: "1h",
      }
    );

    // Generate expired token
    expiredToken = jwt.sign(
      { user: testUser },
      process.env.ACCESS_TOKEN_SECRET || "test-secret",
      {
        expiresIn: "0s",
      }
    );
  });

  it("should pass valid token in authorization header", async () => {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it("should pass valid token in request body", async () => {
    const req = {
      body: {
        token: validToken,
      },
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it("should pass valid token in query params", async () => {
    const req = {
      query: {
        token: validToken,
      },
      headers: {},
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it("should reject request with no token", async () => {
    const req = {
      headers: {},
      body: {},
      query: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: "Token is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject request with invalid token", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidtoken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject request with expired token", async () => {
    // Wait a moment to ensure token expiration
    await new Promise((resolve) => setTimeout(resolve, 100));

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
