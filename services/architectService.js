const architectModel = require("../models/architectModel");

async function createArchitect(data) {
  return await architectModel.createArchitect(data);
}

async function getArchitects() {
  return await architectModel.getArchitects();
}
async function loginUser(phoneNumber, otp) {
  return await architectModel.loginUser(phoneNumber, otp);
}
async function getArchitectById(id) {
  return await architectModel.getArchitectById(id);
}

async function updateArchitect(id, data) {
  return await architectModel.updateArchitect(id, data);
}

async function deleteArchitect(id) {
  return await architectModel.deleteArchitect(id);
}

module.exports = {
  createArchitect,
  getArchitects,
  updateArchitect,
  deleteArchitect,
  getArchitectById,
  loginUser
};
