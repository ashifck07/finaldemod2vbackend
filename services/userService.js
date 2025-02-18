const userModel = require('../models/userModel');

async function registerUser(data) {
  return await userModel.registerUser(data);
}

async function loginUser(phoneNumber, otp) {
  return await userModel.loginUser(phoneNumber, otp);
}


async function getAllUsers() {
  return await userModel.getAllUsers();
}

async function getUserById(userId) {
  return await userModel.getUserById(userId);
}

async function updateUser(userId, data) {
  return await userModel.updateUser(userId, data);
}

async function deleteUser(userId) {
  return await userModel.deleteUser(userId);
}

module.exports = {
  registerUser,
  loginUser,  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
