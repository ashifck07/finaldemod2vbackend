// const designModel = require('../models/designModel');

// async function createDesign(data) {
//   return await designModel.createDesign(data);
// }

// async function getAllDesigns(role, architectName = null) {
//   return await designModel.getAllDesigns(role, architectName);
// }

// async function updateDesign(designId, stateData) {
//   return await designModel.updateDesign(designId, stateData);
// }

// module.exports = {
//   createDesign,
//   getAllDesigns,
//   updateDesign,
// };
const designModel = require('../models/designModel');

async function createDesign(data) {
  return await designModel.createDesign(data);
}

async function getAllDesigns(role, architectName = null) {
  return await designModel.getAllDesigns(role, architectName);
}

async function updateDesign(designId, stageData) {
  return await designModel.updateDesign(designId, stageData);
}
async function getDesignById(designId) {
  return await designModel.getDesignById(designId); 
}
async function deleteDesign(designId) {
  return await designModel.deleteDesign(designId); 
}

module.exports = {
  createDesign,
  getAllDesigns,
  getDesignById,
  updateDesign,
  deleteDesign
};