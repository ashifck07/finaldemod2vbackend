const leadService = require("../services/leadServices");
const {db, admin} = require("../config/firebase");
const {getNextLeadId} = require("../models/leadModel");
const createLead = async (req, res) => {
  try {
    const {name, email, phone, description, assignedArchitect} = req.body;
    const type =
      req.body.source === "estimate" ? "Estimate Lead" : req.body.source === "contactus" ? "Contact Us Lead" : null;

    if (!type) {
      return res.status(400).json({message: "Invalid or missing source parameter."});
    }

    const leadData = {
      name,
      email,
      phone,
      description: description || "To be updated",
      type,
      // assignedArchitect: role === 'master' ? assignedArchitect : null,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newLead = await leadService.createLead(leadData);
    res.status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({message: "Failed to create lead", error: error.message});
  }
};

const getAllLeads = async (req, res) => {
  try {
    console.log("lead controller get", req.user);
    const userId = req.user.uid;
    const role = req.user.role;
    const leads = await leadService.getAllLeads(userId, role);
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({message: "Failed to retrieve leads", error: error.message});
  }
};
const getLeadByLeadId = async (req, res) => {
  try {
    const leads = await LeadModel.getLeadByLeadId();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({message: "Failed to retrieve leads", error: error.message});
  }
};

const getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await leadService.getLeadById(leadId);
    res.status(200).json(lead);
  } catch (error) {
    if (error.message.includes("does not exist")) {
      return res.status(404).json({message: "Lead not found."});
    }
    res.status(500).json({message: "Failed to retrieve lead", error: error.message});
  }
};
// const updateLeadStatus = async (req, res) => {
//   try {
//     const leadId = req.params.id;
//     const userRole = req.user?.role;
//     const {status, assignedArchitect} = req.body;

//     const dataToUpdate = {};
//     if (status) dataToUpdate.status = status;

//     if (assignedArchitect && req.user.role === "master") {
//       dataToUpdate.assignedArchitect = assignedArchitect;
//     }
//     dataToUpdate.updatedAt = new Date().toISOString();

//     const updatedLead = await leadService.updateLead(leadId, dataToUpdate, userRole);
//     res.status(200).json(updatedLead);
//   } catch (error) {
//     console.error("Error updating lead status:", error);
//     res.status(500).json({message: "Failed to update lead status", error: error.message});
//   }
// };
const updateLeadStatus = async (req, res) => {
  try {
    const leadId = req.params.id;
    const userRole = req.user; // Extract user role from the request
    const {status, assignedArchitect} = req.body;

    // Prepare data to update
    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (assignedArchitect) dataToUpdate.assignedArchitect = assignedArchitect;

    // Call the service to update the lead
    const updatedLead = await leadService.updateLead(leadId, dataToUpdate, userRole);

    // Respond with the updated lead
    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({message: "Failed to update lead status", error: error.message});
  }
};

const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const deletedLead = await leadService.deleteLead(leadId);
    res.status(200).json(deletedLead);
  } catch (error) {
    res.status(500).json({message: "Failed to delete lead", error: error.message});
  }
};
const getLeadByArchitect = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log("userId", userId);

    if (!userId) {
      return res.status(400).json({message: "User ID is missing in the request"});
    }
    const lead = await leadService.getLeadByArchitect(userId);
    // Return the leads data
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching leads by architect:", error);
    res.status(500).json({message: "Internal server error", error: error.message});
  }
};
const estimateData = async (req, res) => {
  try {
    const {liveEstimationData, customerData} = req.body;
    if (!liveEstimationData || !customerData) {
      return res.status(400).json({message: "Missing required data."});
    }
    const calculatedData = await leadService.estimateData(liveEstimationData, customerData);
    let description = `Project Type: ${liveEstimationData.projectType || "N/A"}\n`;
    description += `Configuration: ${liveEstimationData.homeConfiguration || "N/A"}\n\n`;
    const formatSection = (title, items, fields) => {
      if (!items.length) return "";
      let section = `${title}:\n`;
      fields.forEach(({label, key, defaultValue = "N/A"}) => {
        const value =
          key === "totalArea"
            ? `${items.reduce((sum, item) => sum + parseFloat(item[key]?.split(" ")[0] || 0), 0)} `
            : `${items[0]?.[key] || defaultValue}`;
        section += `${label}: ${value}\n`;
      });
      section += `Total price: ₹${items.reduce((sum, item) => sum + (item.price || 0), 0)}\n\n`;
      return section;
    };
    const sections = [
      {
        title: "Wardrobe",
        items: calculatedData.wardrobe || [],
        fields: [
          {label: "Number of wardrobes", key: "numberOfWardrobes", defaultValue: 0},
          {label: "Total area", key: "totalArea"},
        ],
      },
      {
        title: "Modular Kitchen",
        items: calculatedData.modularKitchen || [],
        fields: [
          {label: "Type", key: "type"},
          {label: "Total area", key: "totalArea"},
        ],
      },
      {
        title: "Wall Paneling",
        items: calculatedData.wallPaneling || [],
        fields: [
          {label: "Number of panels", key: "numberOfPanels", defaultValue: 0},
          {label: "Total area", key: "totalArea"},
        ],
      },
      {
        title: "False Ceiling",
        items: calculatedData.falseCeiling || [],
        fields: [
          {label: "Type", key: "type"},
          {label: "Total area", key: "totalArea"},
        ],
      },
      {
        title: "Wall Paper",
        items: calculatedData.wallpaper || [],
        fields: [
          {label: "Type", key: "type"},
          {label: "Total area", key: "totalArea"},
        ],
      },
    ];
    sections.forEach(({title, items, fields}) => {
      description += formatSection(title, items, fields);
    });
    description += `\n\nCalculated Data:\n${JSON.stringify(calculatedData, null, 2)}`;
    const leadId = await getNextLeadId();

    const newLead = {
      type: "Estimate Lead",
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      description: description,
      status: "OPEN",
      leadId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedArchitect: null,
    };
    const leadRef = await db.collection("leads").add(newLead);
    const savedLead = await leadRef.get();
    const response = {
      finalAmount: calculatedData.finalAmount,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing estimation:", error);
    res.status(500).json({message: "Failed to process estimation", error: error.message});
  }
};

module.exports = {
  createLead,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  getLeadById,
  getLeadByArchitect,
  estimateData,
};
