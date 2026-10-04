const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, password } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password && password.trim().length > 0) {
      user.password = password;
    }

    // Role cannot be changed via profile update endpoint!
    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const formattedUsers = users.map(u => ({
      id: u._id,
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status === 'active' ? 'Active' : 'Inactive',
      regDate: u.createdAt.toISOString().split('T')[0]
    }));
    return res.json({ success: true, data: formattedUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status (Active / Inactive)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    return res.json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: {
        id: user._id,
        _id: user._id,
        status: user.status === 'active' ? 'Active' : 'Inactive'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers,
  toggleUserStatus
};
