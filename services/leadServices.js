const leadModel = require("../models/leadModel");

async function createLead(data) {
  return await leadModel.createLead(data);
}

async function getAllLeads(userId, role) {
  return await leadModel.getAllLeads(userId, role);
}

async function updateLead(leadId, dataToUpdate, userRole) {
  return await leadModel.updateLead(leadId, dataToUpdate, userRole);
}
async function getLeadById(leadId) {
  return await leadModel.getLeadById(leadId);
}
async function getLeadByArchitect(leadId) {
  return await leadModel.getLeadsByArchitect(leadId);
}

async function deleteLead(leadId) {
  return await leadModel.deleteLead(leadId);
}
async function estimateData(liveEstimationData, customerData) {
  return await leadModel.estimateData(liveEstimationData, customerData);
}
module.exports = {
  createLead,
  getAllLeads,
  updateLead,
  getLeadById,
  getLeadByArchitect,
  deleteLead,
  estimateData
};
