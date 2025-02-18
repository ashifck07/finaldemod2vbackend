// const express = require('express');
// const router = express.Router();
// const activityLogController = require('../controllers/activitylogController');

// // Get activity logs for design and work progress changes
// router.get('/', activityLogController.getActivityLogs);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/activitylogController');
const authMiddleware = require('../middlewares/authorization');

router.get('/notification',authMiddleware(['master']),  getNotifications);

module.exports = router;