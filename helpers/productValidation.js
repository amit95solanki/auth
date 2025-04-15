import { check } from "express-validator";

export const productValidation = [
  check("name", "Product name is required").not().isEmpty().trim(),
  check("description", "Description is required").not().isEmpty(),
  check("price", "Price must be a positive number").isFloat({ min: 0 }),
  check("category", "Category is required").not().isEmpty(),
  check("stock", "Stock must be a non-negative integer").isInt({ min: 0 }),
];

export const updateProductValidation = [
  check("name", "Product name is required").optional().not().isEmpty().trim(),
  check("description", "Description is required").optional().not().isEmpty(),
  check("price", "Price must be a positive number")
    .optional()
    .isFloat({ min: 0 }),
  check("category", "Category is required").optional().not().isEmpty(),
  check("stock", "Stock must be a non-negative integer")
    .optional()
    .isInt({ min: 0 }),
];
