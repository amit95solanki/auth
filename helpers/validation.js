import { check } from "express-validator";

export const registorValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("mobile", "Please include a valid mobile number").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6, minUpperCase: 1, minNumbers: 1, minLowerCase: 1 }),
  check("image", "Please upload an image").custom((value, { req }) => {
    if (
      req.file.minetype === "image/png" ||
      req.file.minetype === "image/jpeg" ||
      req.file.minetype === "image/jpg"
    ) {
      return true;
    } else {
      return false;
    }
  }),
];

export const sendMailVelidator = [
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
];

export const passwordResetValidator = [
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
];

export const loginValidator = [
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
  check("password", "password is required").not().isEmpty(),
];
