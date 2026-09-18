const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/auth.validation.middleware");
const {
  authenticateUser,
} = require("../middleware/user.authentication.middleware");

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
