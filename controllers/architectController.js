const architectService = require("../services/architectService");
const jwt = require("jsonwebtoken");

const createArchitect = async (req, res) => {
  const {name, phone} = req.body;
  try {
    const architectId = await architectService.createArchitect({name, phone});
    res.status(201).json({message: "Architect created successfully", architectId});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const getArchitects = async (req, res) => {
  try {
    const architects = await architectService.getArchitects();
    res.status(200).json(architects);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
const getArchitectById = async (req, res) => {
  const {id} = req.params;
  try {
    const architect = await architectService.getArchitectById(id);
    res.status(200).json(architect);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
const updateArchitect = async (req, res) => {
  const {id} = req.params;
  try {
    const updatedArchitect = await architectService.updateArchitect(id, req.body);
    res.status(200).json({message: "Architect updated successfully", updatedArchitect});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const deleteArchitect = async (req, res) => {
  const {id} = req.params;
  try {
    const response = await architectService.deleteArchitect(id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
const loginUser = async (req, res) => {
  try {
    const {phoneNumber, otp} = req.body;

    if (!phoneNumber) {
      return res.status(400).json({message: "Phone number is required."});
    }

    if (!otp) {
      // Send OTP if not provided
      const response = await architectService.loginUser(phoneNumber);
      return res.status(200).json(response);
    }

    // Validate OTP and generate JWT
    const user = await architectService.loginUser(phoneNumber, otp);    
    const token = jwt.sign({uid: user.uid, role: user.role, name:user.name}, process.env.JWT_SECRET_KEY);

    res.status(200).json({message: "Login successful", token});
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({error: error.message});
  }
};

module.exports = {
  createArchitect,
  getArchitects,
  updateArchitect,
  deleteArchitect,
  getArchitectById,
  loginUser,
};
