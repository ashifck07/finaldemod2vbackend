const jwt = require("jsonwebtoken");
const customerService = require("../services/customerService");
require("dotenv").config();

const registerCustomer = async (req, res) => {
  try {
    const {name, phoneNumber, role} = req.body;

    if (!name || !phoneNumber || !role) {
      return res.status(400).json({message: "Name, phone number, and role are required."});
    }

    const newUser = await customerService.registerCustomer({name, phoneNumber, role});
    res.status(201).json({message: "User registered successfully", user: newUser});
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({message: "Failed to register user", error: error.message});
  }
};

const loginCustomer = async (req, res) => {
  try {
    const {phoneNumber, otp} = req.body;

    if (!phoneNumber) {
      return res.status(400).json({message: "Phone number is required."});
    }

    if (!otp) {
      // Send OTP if not provided
      const response = await customerService.loginCustomer(phoneNumber);
      return res.status(200).json(response);
    }

    // Validate OTP and generate JWT
    const user = await customerService.loginCustomer(phoneNumber, otp);
    const token = jwt.sign({uid: user.uid, role: user.role}, process.env.JWT_SECRET_KEY);

    res.status(200).json({message: "Login successful", token, id: user.uid});
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({error: error.message});
  }
};

const getCustomerById = async (req, res) => {
  try {
    const {id} = req.params;
    const userId = id;
    console.log(userId);

    const user = await customerService.getCustomerById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({message: "Failed to retrieve user", error: error.message});
  }
};

const updateCustomer = async (req, res) => {
  try {
    const {userId} = req.params;
    const updateData = req.body;
    const result = await customerService.updateCustomer(userId, updateData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({message: "Failed to update user", error: error.message});
  }
};

const designApproval = async (req, res) => {
  try {
    const projectId = req.params.id;
    const requestBody = req.body;
    
    const userId = req.user.uid;
    if (!projectId) {
      return res.status(400).json({message: "Project ID is required."});
    }
    const result = await customerService.designApproval(projectId, requestBody, userId);
    console.log("Result from customerService:", result);
    if (result.message === "OTP generated and saved. Please verify to approve.") {
      return res.status(200).json({message: result.message});
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in designApprovalController:", error.message);
    return res.status(500).json({message: error.message});
  }
};
module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomer,
  designApproval,
};
