const {db, admin} = require("../config/firebase");

async function getNextProjectId() {
  const counterRef = db.collection("counters").doc("workProgressCounter");

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


const createWorkProgress = async (data) => {
  try {
    const {name, phone, assignedArchitect, status, description, img} = data;

    // Generate the next project ID
    const projectId = await getNextProjectId();

    // Preset stages
    const stages = [
      {name: "Work Started", description: "", img: [], enabled: false},
      {name: "Materials Arrived", description: "", img: [], enabled: false},
      {name: "Assembly Finished", description: "", img: [], enabled: false},
      {name: "Ready to Deliver", description: "", img: [], enabled: false},
    ];

    // Find the stage matching the status and update it
    const stageIndex = stages.findIndex((stage) => stage.name === status);
    if (stageIndex !== -1) {
      stages[stageIndex].description = description;
      stages[stageIndex].img = img; // Store multiple image URLs in the img array
      stages[stageIndex].enabled = true;

      // Enable all previous stages if the current status is "Assembly Finished"
      if (status === "Assembly Finished") {
        for (let i = 0; i <= stageIndex; i++) {
          stages[i].enabled = true;
        }
      }
    }

    // Save the new work progress with the stages in Firestore
    const workProgressRef = db.collection("workProgress");
    const newWorkProgress = await workProgressRef.add({
      projectId,
      name,
      phone,
      assignedArchitect,
      status,
      stages, // Save the stages with images and status
    });

    return {id: newWorkProgress.id, projectId, ...data}; // Return the ID and projectId along with the data
  } catch (error) {
    throw new Error("Error creating work progress: " + error.stack);
  }
};

const updateWorkProgress = async (workProgressId, updateData) => {
  try {
    const workProgressRef = db.collection("workProgress").doc(workProgressId);
    await workProgressRef.update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
    const updatedDoc = await workProgressRef.get();
    return {id: updatedDoc.id, ...updatedDoc.data()};
  } catch (error) {
    console.error("Error updating work progress:", error);
    throw new Error(`Failed to update work progress: ${error.message}`);
  }
};
const getWorkProgressById = async (workProgressId) => {
  try {
    const doc = await db.collection("workProgress").doc(workProgressId).get();
    if (!doc.exists) {
      throw new Error("Work progress entry not found.");
    }
    return {id: doc.id, ...doc.data()};
  } catch (error) {
    console.error("Error retrieving work progress by ID:", error);
    throw new Error(`Failed to retrieve work progress: ${error.message}`);
  }
};


const getAllWorkProgresses = async (type, userId, role) => {
  try {
    let workProgressRef;
    if (role === "architect") {
      workProgressRef = db.collection("projects").where("type", "==", type).where("assignedArchitect", "==", userId);
    } else if (role === "master") {
      workProgressRef = db.collection("projects").where("type", "==", type);
    }
    const snapshot = await workProgressRef.get();
    let workProgressList = [];

    snapshot.forEach((doc) => {
      workProgressList.push({id: doc.id, ...doc.data()});
    });

    // Sort the list based on createdAt in descending order
    workProgressList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return workProgressList;
  } catch (error) {
    throw new Error("Error fetching work progress entries: " + error.message);
  }
};
// const getAllWorkProgresses = async () => {
//   try {
//     const workProgressRef = db.collection("projects").orderBy("createdAt", "desc");
//     const snapshot = await workProgressRef.get();
//     let workProgressList = [];
//     snapshot.forEach((doc) => {
//       workProgressList.push({id: doc.id, ...doc.data()});
//     });
//     return workProgressList;
//   } catch (error) {
//     throw new Error("Error fetching work progress entries: " + error.message);
//   }
// };

module.exports = {
  createWorkProgress,
  updateWorkProgress,
  getAllWorkProgresses,
  getWorkProgressById,
};
