const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/authValidation");
const authenticateUser = require("../middleware/authenticateUser");

const authRouter = express.Router();

authRouter.post("/signUp", registerValidation, authController.register);
authRouter.post("/login", loginValidation, authController.login);
authRouter.get("/me", authenticateUser, authController.getMe);
authRouter.put(
  "/update-password",
  authenticateUser,
  authController.updatePassword,
);

module.exports = authRouter;
