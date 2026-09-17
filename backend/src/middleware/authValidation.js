const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .notEmpty()
    .isLength({ min: 5, max: 20 })
    .withMessage("Name must be between 5 and 20 characters"),

  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("address")
    .optional()
    .isLength({ max: 400 })
    .withMessage("Address cannot exceed 400 characters"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["USER", "STORE_OWNER", "ADMIN"])
    .withMessage("Role must be USER, STORE_OWNER, or ADMIN"),
];

const loginValidation = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
