const {db} = require("../config/firebase"); // Firebase Firestore instance
require("dotenv").config(); // Load environment variables
const axios = require("axios");

const getNextProjectId = async () => {
  const projectIdRef = db.collection("counters").doc("projectcounter");
  const doc = await projectIdRef.get();

  if (!doc.exists) {
    // If the document doesn't exist, initialize it with ID 1
    await projectIdRef.set({lastProjectId: 1});
    return "D2V001";
  } else {
    const lastProjectId = doc.data().lastProjectId;
    const nextProjectId = lastProjectId + 1;
    // Update the counter with the new project ID
    await projectIdRef.update({lastProjectId: nextProjectId});
    return `D2V${nextProjectId}`;
  }
};
const logActivity = async (architectName, projectId, type, previousStatus, newStatus) => {
  try {
    const activityLogRef = db.collection("activitylog");
    const timestamp = new Date().toISOString();

    const message = `${architectName} changed ${projectId} ${type} status from '${previousStatus}' to '${newStatus}'`;

    await activityLogRef.add({
      message,
      createdAt: timestamp,
    });

    console.log("Activity logged successfully:", message);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
const getEstimateForStage = async (stageName, selection) => {
  const estimateQuerySnapshot = await db
    .collection("estimates")
    .where("stageId", "==", stageName)
    .where("type", "==", selection)
    .get();

  if (!estimateQuerySnapshot.empty) {
    const estimateDoc = estimateQuerySnapshot.docs[0];
    return estimateDoc.data();
  }
  return null;
};

const sendSMS = async ({phoneNumbers, variableValues = "", type}) => {
  let templateId;
  if (type === "otp") {
    templateId = "179621";
  } else if (type === "projectinitiated") {
    templateId = "179624";
  } else if (type === "architectadded") {
    templateId = "179627";
  } else if (type === "Materials Arrived") {
    templateId = "179625";
  } else if (type === "Assembly Finished") {
    templateId = "179620";
  } else if (type === "Ready to Deliver") {
    templateId = "179630";
  } else if (type === "Moodboard/Basicdesign") {
    templateId = "179619";
  } else if (type === "Final Design") {
    templateId = "179629";
  } else if (type === "Premium/Luxury") {
    templateId = "179628";
  } else if (type === "Final Estimation") {
    templateId = "179622";
  } else if (type === "Estimation Confirmed") {
    templateId = "179626";
  }
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "dlt",
        sender_id: process.env.FAST2SMS_SENDER_ID,
        message: templateId,
        variables_values: variableValues,
        schedule_time: "",
        flash: 0,
        numbers: phoneNumbers,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" SMS Sent Successfully:", response.data);
  } catch (error) {
    console.error("Error Sending SMS:", error.response ? error.response.data : error.message);
  }
};

module.exports = {
  getNextProjectId,
  logActivity,
  getEstimateForStage,
  sendSMS,
};
