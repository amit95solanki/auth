import { validationResult } from "express-validator";
import {
  registorValidation,
  sendMailVelidator,
  passwordResetValidator,
  loginValidator,
} from "../../helpers/validation.js";

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

// Mock express-validator
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
  check: jest.fn().mockImplementation((field, message) => ({
    not: jest.fn().mockReturnThis(),
    isEmpty: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
  })),
}));

describe("Validation Helpers", () => {
  describe("Registration Validation", () => {
    it("should have required validation rules", () => {
      expect(registorValidation).toBeInstanceOf(Array);
      expect(registorValidation.length).toBe(5); // 5 validation rules
    });
  });

  describe("Send Mail Validation", () => {
    it("should have required validation rules", () => {
      expect(sendMailVelidator).toBeInstanceOf(Array);
      expect(sendMailVelidator.length).toBe(1); // 1 validation rule
    });
  });

  describe("Password Reset Validation", () => {
    it("should have required validation rules", () => {
      expect(passwordResetValidator).toBeInstanceOf(Array);
      expect(passwordResetValidator.length).toBe(1); // 1 validation rule
    });
  });

  describe("Login Validation", () => {
    it("should have required validation rules", () => {
      expect(loginValidator).toBeInstanceOf(Array);
      expect(loginValidator.length).toBe(2); // 2 validation rules
    });
  });
});
