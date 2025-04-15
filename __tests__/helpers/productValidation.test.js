import {
  productValidation,
  updateProductValidation,
} from "../../helpers/productValidation.js";

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

// Mock express-validator
jest.mock("express-validator", () => ({
  check: jest.fn().mockImplementation((field, message) => ({
    not: jest.fn().mockReturnThis(),
    isEmpty: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
  })),
}));

describe("Product Validation Helpers", () => {
  describe("Product Creation Validation", () => {
    it("should have required validation rules", () => {
      expect(productValidation).toBeInstanceOf(Array);
      expect(productValidation.length).toBe(5); // 5 validation rules
    });
  });

  describe("Product Update Validation", () => {
    it("should have required validation rules", () => {
      expect(updateProductValidation).toBeInstanceOf(Array);
      expect(updateProductValidation.length).toBe(5); // 5 validation rules
    });
  });
});
