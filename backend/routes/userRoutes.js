const express = require('express');
const { getUserProfile, updateUserProfile, getUsers, toggleUserStatus } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, adminOnly, getUsers);
router.put('/:id/status', protect, adminOnly, toggleUserStatus);

module.exports = router;
