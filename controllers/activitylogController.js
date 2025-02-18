// const activityLogService = require('../services/activitylogService');

// const getActivityLogs = async (req, res) => {
//   try {
//     const logs = await activityLogService.getActivityLogs();
//     res.status(200).json(logs);
//   } catch (error) {
//     console.error('Error retrieving activity logs:', error);

//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getActivityLogs,
// };


const {db} = require('../config/firebase'); 

const getNotifications = async (req, res) => {
  try {
    const activityLogRef = db.collection('activitylog');
    const snapshot = await activityLogRef
      .orderBy('createdAt', 'desc') 
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No notifications found',
        data: [],
      });
    }

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

module.exports = { getNotifications };