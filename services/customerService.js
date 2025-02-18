const CustomerModel = require("../models/customerModel");

async function registerCustomer(data) {
  return await CustomerModel.registerCustomer(data);
}

async function loginCustomer(phoneNumber, otp) {
  return await CustomerModel.loginCustomer(phoneNumber, otp);
}

async function getCustomerById(userId) {
  return await CustomerModel.getCustomerById(userId);
}

async function updateCustomer(userId, data) {
  return await CustomerModel.updateCustomer(userId, data);
}
async function designApproval(projectId, requestBody ,userId) {
  return await CustomerModel.designApproval(projectId, requestBody ,userId);
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomer,
  designApproval,
};
