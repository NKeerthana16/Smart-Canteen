const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFoods = await Food.countDocuments();
    const orders = await Order.find({}).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      o => o.status === 'Placed' || o.status === 'Accepted' || o.status === 'Preparing'
    ).length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;

    const totalRevenue = orders.reduce((acc, o) => {
      return o.status !== 'Cancelled' ? acc + o.totalAmount : acc;
    }, 0);

    const recentOrders = orders.slice(0, 5).map(o => ({
      _id: o._id,
      id: o.orderId,
      userEmail: o.userEmail,
      userName: o.userName,
      totalAmount: o.totalAmount,
      status: o.status,
      orderDate: o.createdAt.toISOString().replace('T', ' ').substring(0, 16)
    }));

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalFoods,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin report analytics
// @route   GET /api/admin/reports
// @access  Private/Admin
const getAdminReports = async (req, res) => {
  try {
    const orders = await Order.find({});

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const pendingOrders = orders.filter(
      o => o.status === 'Placed' || o.status === 'Accepted' || o.status === 'Preparing'
    ).length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    const totalRevenue = orders.reduce((acc, o) => {
      return o.status !== 'Cancelled' ? acc + o.totalAmount : acc;
    }, 0);

    // Calculate popular foods
    const itemCounts = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled' && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = 0;
          }
          itemCounts[item.name] += item.quantity;
        });
      }
    });

    const popularItems = Object.keys(itemCounts)
      .map(name => ({ name, count: itemCounts[name] }))
      .sort((a, b) => b.count - a.count);

    return res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        popularItems,
        mostOrderedFood: popularItems.length > 0 ? popularItems[0].name : 'N/A'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminReports
};
