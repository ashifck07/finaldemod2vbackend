const {db, admin} = require("../config/firebase");
const {logActivity} = require("../helpers/projectIdHelper");

async function getNextLeadId() {
  const counterRef = db.collection("counters").doc(`LeadCounter`);
  try {
    const doc = await counterRef.get();
    let count;
    if (doc.exists) {
      count = doc.data().count + 1;
      await counterRef.update({count});
    } else {
      count = 1;
      await counterRef.set({count});
    }

    return `D2V${count.toString()}`;
  } catch (error) {
    throw new Error(`Failed to get next lead ID: ${error.message}`);
  }
}
async function createLead(data) {
  try {
    //  phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(data.phone)) {
      throw new Error("Phone number must be exactly 10 digits");
    }

    // for unique phone number
    const snapshot = await db.collection("leads").where("phone", "==", data.phone).get();

    if (!snapshot.empty) {
      throw new Error("Phone number already exists");
    }
    const timestamp = new Date().toISOString();
    const leadId = await getNextLeadId();
    const leadData = {
      ...data,
      assigned_to: null,
      leadId,
      status: data.status || "OPEN",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const leadRef = await db.collection("leads").add(leadData);
    return {id: leadRef.id, ...leadData};
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

async function getAllLeads(userId, role) {
  try {
    let leadRef;
    if (role === "architect") {
      leadRef = db.collection("leads").where("assignedArchitect", "==", userId);
    } else if (role === "master") {
      leadRef = db.collection("leads");
    }
    const leadsSnapshot = await leadRef.get();
    if (leadsSnapshot.empty) {
      return [];
    }
    const leads = leadsSnapshot.docs.map((doc) => {
      const data = doc.data();
      // const isMissingFields = !data.status || !data.createdAt || !data.type;

      // if (isMissingFields) {
      //   console.warn(`Missing fields in lead with ID ${doc.id}:`, {
      //     status: data.status,
      //     createdAt: data.createdAt,
      //     type: data.type,
      //   });
      // }

      return {
        id: doc.id,
        type: data.type || "unknown",
        name: data.name || "Unnamed",
        email: data.email || "No email",
        phone: data.phone || "No phone",
        description: data.description || "No description",
        status: data.status || "open",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        assignedArchitect: data.assignedArchitect || null,
        leadId: data.leadId || "No ID",
      };
    });
    // Sort the leads locally by createdAt in descending order
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return the sorted leads
    return leads;
  } catch (error) {
    console.error("Error retrieving leads:", error);
    throw new Error("Failed to retrieve leads.");
  }
}
async function getLeadsByArchitect(userId) {
  try {
    // Fetch leads assigned to the architect
    const leadsCollection = db.collection("leads");
    const leadsSnapshot = await leadsCollection.where("assignedArchitect", "==", userId).get();

    // Check if any leads are found
    if (leadsSnapshot.empty) {
      return [];
    }
    // Process the leads data
    const leads = leadsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "unknown",
        name: data.name || "Unnamed",
        email: data.email || "No email",
        phone: data.phone || "No phone",
        description: data.description || "No description",
        status: data.status || "open",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        assignedArchitect: data.assignedArchitect || null,
        leadId: data.leadId || "No ID",
      };
    });

    // Sort the leads locally by createdAt in descending order
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return the sorted leads
    return leads;
  } catch (error) {
    console.error("Error retrieving leads by architect:", error);
    throw new Error(`Failed to retrieve leads by architect: ${error.message}`);
  }
}

async function getLeadById(leadId) {
  try {
    const leadRef = db.collection("leads").doc(leadId);
    const leadSnapshot = await leadRef.get();

    if (!leadSnapshot.exists) {
      throw new Error(`Lead with ID ${leadId} does not exist.`);
    }

    const leadData = leadSnapshot.data();
    return {
      id: leadSnapshot.id,
      ...leadData,
      createdAt: leadData.createdAt,
      updatedAt: leadData.updatedAt,
    };
  } catch (error) {
    console.error("Error retrieving lead by ID:", error);
    throw new Error(`Failed to retrieve lead: ${error.message}`);
  }
}
async function updateLead(leadId, updateData, userRole) {
  try {
    const leadRef = db.collection("leads").doc(leadId);
    const leadSnapshot = await leadRef.get();
    const leadData = leadSnapshot.data();
    // Check if the lead exists
    if (!leadSnapshot.exists) {
      throw new Error(`Lead with ID ${leadId} does not exist.`);
    }

    const allowedUpdates = {};

    // Check and update status if provided
    if (updateData.status) {
      allowedUpdates.status = updateData.status;
      const name = userRole.name;
      const projectId = leadData.leadId;
      const type = leadData.type;
      const previousStatus = leadData.status;
      const newStatus = updateData.status;
      logActivity(name, projectId, type, previousStatus, newStatus);
    }

    // Check and update assignedArchitect if provided and user is a "master"
    if (updateData.assignedArchitect) {
      if (userRole.role === "master") {
        allowedUpdates.assignedArchitect = updateData.assignedArchitect;
      } else {
        throw new Error("Insufficient permissions to assign architect.");
      }
    }

    // If no valid fields to update, throw an error
    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error("No valid fields to update or insufficient permissions.");
    }

    // Always update the `updatedAt` field
    const timestamp = new Date().toISOString();
    allowedUpdates.updatedAt = timestamp;

    // Update the document
    await leadRef.update(allowedUpdates);

    // Retrieve the updated document
    const updatedLeadSnapshot = await leadRef.get();
    return {id: leadId, ...updatedLeadSnapshot.data()};
  } catch (error) {
    console.error("Error updating lead:", error.message);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
}

async function deleteLead(leadId) {
  try {
    const leadRef = db.collection("leads").doc(leadId);
    const leadSnapshot = await leadRef.get();

    if (!leadSnapshot.exists) {
      throw new Error(`Lead with ID ${leadId} does not exist.`);
    }

    await leadRef.delete();
    return {message: "Lead successfully deleted."};
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}
async function estimateData(liveEstimationData, customerData) {
  try {
    let calculatedData = {};
    let totalAmount = 0;
    const priceMapping = {
      wardrobe: 1200,
      modularKitchen: 2700,
      wallPaneling: 650,
      falseCeiling: 120,
      wallpaper: 100,
    };
    Object.keys(liveEstimationData).forEach((key) => {
      const sectionData = liveEstimationData[key];
      if (sectionData && typeof sectionData === "object") {
        let totalArea = 0;
        if (sectionData.area && Array.isArray(sectionData.area)) {
          totalArea = sectionData.area.reduce((sum, val) => {
            return sum + (typeof val === "string" ? parseFloat(val.split(" ")[0]) : val);
          }, 0);
        } else if (sectionData.approxArea) {
          totalArea = parseFloat(sectionData.approxArea.split(" ")[0]) || 0;
        }
        const pricePerSqFt = priceMapping[key] || 0;
        const sectionPrice = pricePerSqFt * totalArea;
        totalAmount += sectionPrice;
        calculatedData[key] = {
          totalArea: `${totalArea} sq.ft`,
          price: sectionPrice,
        };
      }
    });
    calculatedData.finalAmount = totalAmount;
    console.log("Final Calculated Data:", JSON.stringify(calculatedData, null, 2));
    return calculatedData;
  } catch (error) {
    console.error("Error in estimateData:", error.message);
    throw new Error(`Failed to calculate data: ${error.message}`);
  }
}
module.exports = {
  getNextLeadId,
  createLead,
  getAllLeads,
  getLeadsByArchitect,
  updateLead,
  getLeadById,
  deleteLead,
  estimateData,
};
