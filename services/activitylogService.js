const activityLogModel = require('../models/activitylogModel');

async function getActivityLogs() {
  try {
    const designChanges = await activityLogModel.getDesignChanges();
    const workProgressChanges = await activityLogModel.getWorkProgressChanges();

    const designLogs = designChanges.map(change => {
      if (change.oldStatus && change.newStatus) {
        return `${change.updatedBy} updated ${change.projectId} design status from "${change.oldStatus}" to "${change.newStatus}"`;
      }
      return null;
    }).filter(log => log); 

    const progressLogs = workProgressChanges.map(change => {
      if (change.oldStatus && change.newStatus) {
        return `${change.updatedBy} updated ${change.projectId} work progress status from "${change.oldStatus}" to "${change.newStatus}"`;
      }
      return null;
    }).filter(log => log); 

    return [...designLogs, ...progressLogs];
  } catch (error) {
    console.error('Error processing activity logs:', error);
    throw new Error('Failed to process activity logs.');
  }
}

module.exports = {
  getActivityLogs,
};
