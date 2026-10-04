const express = require('express');
const { createFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createFeedback);
router.get('/', protect, getFeedback);

module.exports = router;
