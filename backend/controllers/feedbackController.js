const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Student/Admin)
const createFeedback = async (req, res) => {
  try {
    const { rating, comment, orderId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      orderId: orderId || 'General',
      rating: parseInt(rating),
      comment
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: feedback
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feedback list (Student sees own feedback; Admin sees all feedback)
// @route   GET /api/feedback
// @access  Private
const getFeedback = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

    const formattedFeedbacks = feedbacks.map(fb => ({
      _id: fb._id,
      id: fb._id,
      userEmail: fb.userEmail,
      userName: fb.userName,
      orderId: fb.orderId,
      rating: fb.rating,
      comment: fb.comment,
      date: fb.createdAt.toISOString().split('T')[0]
    }));

    return res.json({ success: true, data: formattedFeedbacks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedback
};
