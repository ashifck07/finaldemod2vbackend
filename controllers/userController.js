const jwt = require("jsonwebtoken");
const userService = require("../services/userService");
require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const {name, phoneNumber, role} = req.body;

    if (!name || !phoneNumber || !role) {
      return res.status(400).json({message: "Name, phone number, and role are required."});
    }

    const newUser = await userService.registerUser({name, phoneNumber, role});
    res.status(201).json({message: "User registered successfully", user: newUser});
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({message: "Failed to register user", error: error.message});
  }
};




const loginUser = async (req, res) => {
  try {
    const { phoneNumber, otp, resend } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    if (resend) {
      const response = await userService.loginUser(phoneNumber); // Resend OTP logic
      return res.status(200).json({ message: "OTP resent successfully", ...response });
    }

    if (!otp) {
      // Send OTP if not provided
      const response = await userService.loginUser(phoneNumber);
      return res.status(200).json(response);
    }

    // Validate OTP and generate JWT
    const user = await userService.loginUser(phoneNumber, otp);
    const token = jwt.sign({ uid: user.uid, role: user.role, name: user.name }, process.env.JWT_SECRET_KEY);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ error: error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({message: "Failed to retrieve users", error: error.message});
  }
};

const getUserById = async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({message: "Failed to retrieve user", error: error.message});
  }
};

const updateUser = async (req, res) => {
  try {
    const {userId} = req.params;
    const updateData = req.body;
    const result = await userService.updateUser(userId, updateData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({message: "Failed to update user", error: error.message});
  }
};

const deleteUser = async (req, res) => {
  try {
    const {userId} = req.params;
    const result = await userService.deleteUser(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({message: "Failed to delete user", error: error.message});
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
