const UserRepository = require("../db/usersRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==================== REGISTER ====================

const register = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    // Check whether the email is already registered
    const existing = await UserRepository.findByEmail(email);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the plain-text password before storing it
    const passwordHash = await bcrypt.hash(password, 10);

    // Only allow user or owner during registration
    // Admin should not be created through public registration
    const userRole = role === "owner" ? "owner" : "user";

    // Create the user in the database
    const newUser = await UserRepository.createUser({
      name,
      email,
      passwordHash,
      address,
      userRole,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during registration:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==================== LOGIN ====================

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user using their email
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is Not Registered",
      });
    }

    // Compare the entered password with the hashed password
    // stored in the password_hash database column
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Create JWT token after successful authentication
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error during login:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==================== GET CURRENT USER ====================

const getMe = async (req, res) => {
  try {
    // Use the same repository variable that was imported above
    const user = await UserRepository.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE PASSWORD ====================

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get the currently authenticated user
    const user = await UserRepository.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare old password with the stored password hash
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash the new password before saving it
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password_hash in the database
    await UserRepository.updatePassword(user.id, newPasswordHash);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error during password update:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Export controller functions
module.exports = {
  register,
  login,
  getMe,
  updatePassword,
};
