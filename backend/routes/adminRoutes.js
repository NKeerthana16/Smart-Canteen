const express = require('express');
const { getAdminDashboard, getAdminReports } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getAdminDashboard);
router.get('/reports', protect, adminOnly, getAdminReports);

module.exports = router;
