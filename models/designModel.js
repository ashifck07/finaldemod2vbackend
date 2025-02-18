
const {db, admin} = require("../config/firebase");
async function getNextProjectId() {
  const counterRef = db.collection("counters").doc("designCounter");
  try {
    const doc = await counterRef.get();
    let count;
    if (doc.exists) {
      count = doc.data().count || 0;
      count += 1;
      await counterRef.update({count});
    } else {
      count = 1;
      await counterRef.set({count});
    }
    return `Project ${String(count).padStart(4, "0")}`;
  } catch (error) {
    throw new Error(`Failed to get next project ID: ${error.message}`);
  }
}
const createDesign = async (data) => {
  try {
    const {name, email, phone, assignedArchitect, images, status} = data;
    const projectId = await getNextProjectId();
    const stages = [
      {name: "Mood Board", images: [], enabled: false, updatedAt: null},
      {name: "Basic Design", images: [], enabled: false, updatedAt: null},
      {name: "Final Design", images: [], enabled: false, updatedAt: null, approved: false},
      {
        name: "Premium/Luxury",
        estimate: [
          {
            premium: {
              fileUpload: [],
              data: {},
              selected: false,
            },
          },
          {
            luxury: {
              fileUpload: [],
              data: {},
              selected: false,
            },
          },
        ],
        enabled: false,
        updatedAt: null,
        approved: false,
      },
      {name: "Final Estimation", selectedDesign: {}, amount: null, enabled: false, updatedAt: null, approved: false},
      {
        name: "Estimation Confirmed",
        selectedDesign: {},
        amount: null,
        enabled: false,
        updatedAt: null,
        approved: false,
      },
    ];
    const stageIndex = stages.findIndex((state) => state.name === status);
    if (stageIndex !== -1) {
      stages[stageIndex].img = images || [];
      stages[stageIndex].enabled = true;
      for (let i = 0; i <= stageIndex; i++) {
        stages[i].enabled = true;
      }
    }
    const designRef = db.collection("projects");
    const newDesign = await designRef.add({
      projectId,
      name,
      email,
      phone,
      assignedArchitect,
      status,
      stages,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {id: newDesign.id, projectId, ...data};
  } catch (error) {
    throw new Error("Error creating design: " + error.message);
  }
};
const updateDesign = async (designId, stageData) => {
  try {
    const designRef = db.collection("projects").doc(designId);
    if (stageData.stages && Array.isArray(stageData.stages)) {
      const stages = {};
      stageData.stages.forEach((stage, index) => {
        const stageId = `stageId${index + 1}`;
        stages[stageId] = {
          ...stage,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
      });
      stageData.stages = stages;
    }
    await designRef.update({
      ...stageData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedDoc = await designRef.get();
    const updatedData = updatedDoc.data();
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    if (updatedData.stages) {
      for (let stageId in updatedData.stages) {
        if (updatedData.stages[stageId].updatedAt && updatedData.stages[stageId].updatedAt.toDate) {
          updatedData.stages[stageId].updatedAt = updatedData.stages[stageId].updatedAt.toDate().toISOString();
        }
      }
    }
    return {id: updatedDoc.id, ...updatedData};
  } catch (error) {
    console.error("Error updating design:", error);
    throw new Error(`Failed to update design: ${error.message}`);
  }
};
const getDesignById = async (designId) => {
  try {
    const doc = await db.collection("projects").doc(designId).get();
    if (!doc.exists) {
      throw new Error("Design not found.");
    }
    return {id: doc.id, ...doc.data()};
  } catch (error) {
    console.error("Error retrieving design by ID:", error);
    throw new Error(`Failed to retrieve design: ${error.message}`);
  }
};
const getAllDesigns = async () => {
  try {
    const designRef = db.collection("projects").where("type", "==", "design");
    const snapshot = await designRef.get();
    let designList = [];
    snapshot.forEach((doc) => {
      designList.push({id: doc.id, ...doc.data()});
    });
    // Sort the results in memory by createdAt (descending)
    designList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return designList;
  } catch (error) {
    throw new Error("Error fetching designs: " + error.message);
  }
};
const deleteDesign = async (designId) => {
  try {
    const designRef = db.collection("projects").doc(designId);
    const designDoc = await designRef.get();
    if (!designDoc.exists) {
      throw new Error("Design not found");
    }
    await designRef.delete();
    return {message: "Design deleted successfully"};
  } catch (error) {
    console.error("Error deleting design:", error);
    throw new Error(`Failed to delete design: ${error.message}`);
  }
};
module.exports = {
  createDesign,
  updateDesign,
  getAllDesigns,
  getDesignById,
  deleteDesign,
};
