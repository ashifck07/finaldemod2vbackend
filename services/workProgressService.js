const workProgressModel = require("../models/workProgressModel");

async function createWorkProgress(data) {
  return await workProgressModel.createWorkProgress(data);
}

async function updateWorkProgress(workProgressId, updateData) {
  return await workProgressModel.updateWorkProgress(workProgressId, updateData);
}

async function getAllWorkProgresses(type, userId, role) {
  return await workProgressModel.getAllWorkProgresses(type, userId, role);
}
const getWorkProgressById = async (id) => {
  return await workProgressModel.getWorkProgressById(id);
};

const deleteWorkProgress = async (id) => {
  return await workProgressModel.deleteWorkProgress(id);
};

module.exports = {
  createWorkProgress,
  updateWorkProgress,
  getAllWorkProgresses,
  getWorkProgressById,
  deleteWorkProgress,
};
