const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/authValidation");

const authRouter = express.Router();

authRouter.post("/signUp", registerValidation, authController.register);
authRouter.post("/login", loginValidation, authController.login);
authRouter.get("/me", authController.getMe);
authRouter.put("/update-password", authController.updatePassword);

module.exports = authRouter;
