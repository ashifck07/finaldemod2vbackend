const { db } = require('../config/firebase');

async function getDesignChanges() {
  const designSnapshot = await db.collection('design').get();
  return designSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      updatedBy: data.assignedArchitect || 'Unknown',
      projectId: data.projectId || 'Unknown Project',
      oldStatus: data.oldDesignStatus || 'Unknown',
      newStatus: data.newDesignStatus || 'Unknown',
    };
  });
}

async function getWorkProgressChanges() {
  const progressSnapshot = await db.collection('workProgress').get();
  return progressSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      updatedBy: data.assignedArchitect || 'Unknown',
      projectId: data.projectId || 'Unknown Project',
      oldStatus: data.oldProgressStatus || 'Unknown',
      newStatus: data.newProgressStatus || 'Unknown',
    };
  });
}

module.exports = {
  getDesignChanges,
  getWorkProgressChanges,
};
