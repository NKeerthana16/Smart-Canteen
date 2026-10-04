const Order = require('../models/Order');
const Food = require('../models/Food');
const PickupSlot = require('../models/PickupSlot');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Student/Admin)
const createOrder = async (req, res) => {
  try {
    const { items, pickupSlot, pickupDate, paymentMethod, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order' });
    }

    if (!pickupSlot) {
      return res.status(400).json({ success: false, message: 'Pickup slot time is required' });
    }

    // 1. Check pickup slot existence & atomic capacity check
    // Query condition: match time string and ensure bookedCount < maxCapacity
    const slot = await PickupSlot.findOneAndUpdate(
      {
        $or: [{ time: pickupSlot }, { _id: pickupSlot.match(/^[0-9a-fA-F]{24}$/) ? pickupSlot : null }],
        status: 'active',
        $expr: { $lt: ['$bookedCount', '$maxCapacity'] }
      },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: 'Selected pickup slot is FULL or unavailable. Please choose another pickup slot.'
      });
    }

    // 2. Validate items & calculate prices on the server (do not trust frontend totals)
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Find food in database by ID or name
      let foodDoc = null;
      if (item.id && String(item.id).match(/^[0-9a-fA-F]{24}$/)) {
        foodDoc = await Food.findById(item.id);
      }
      if (!foodDoc && item.name) {
        foodDoc = await Food.findOne({ name: item.name });
      }

      if (!foodDoc) {
        // Rollback slot booking if item invalid
        await PickupSlot.findByIdAndUpdate(slot._id, { $inc: { bookedCount: -1 } });
        return res.status(400).json({ success: false, message: `Food item "${item.name}" no longer exists` });
      }

      if (!foodDoc.available) {
        // Rollback slot booking if item unavailable
        await PickupSlot.findByIdAndUpdate(slot._id, { $inc: { bookedCount: -1 } });
        return res.status(400).json({ success: false, message: `Food item "${foodDoc.name}" is currently sold out` });
      }

      const qty = parseInt(item.quantity) || 1;
      const price = foodDoc.price;
      const subtotal = price * qty;
      calculatedTotal += subtotal;

      validatedItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: price,
        quantity: qty,
        subtotal: subtotal
      });
    }

    // 3. Generate unique order ID (ORD-XXXX)
    let uniqueId = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      uniqueId = `ORD-${randNum}`;
      const existing = await Order.findOne({ orderId: uniqueId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      uniqueId = `ORD-${Date.now()}`;
    }

    // 4. Create Order
    const order = await Order.create({
      orderId: uniqueId,
      user: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: validatedItems,
      totalAmount: calculatedTotal,
      pickupSlot: slot._id,
      pickupSlotTime: slot.time,
      pickupDate: pickupDate || new Date().toISOString().split('T')[0],
      status: 'Placed',
      paymentMethod: paymentMethod || 'Counter Cash / UPI',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        _id: order._id,
        id: order.orderId,
        orderId: order.orderId,
        userEmail: order.userEmail,
        userName: order.userName,
        items: order.items,
        totalAmount: order.totalAmount,
        pickupDate: order.pickupDate,
        pickupSlot: order.pickupSlotTime,
        status: order.status,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders (Student sees own orders; Admin sees all orders)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const formattedOrders = orders.map(o => ({
      _id: o._id,
      id: o.orderId,
      orderId: o.orderId,
      userEmail: o.userEmail,
      userName: o.userName,
      items: o.items,
      totalAmount: o.totalAmount,
      orderDate: o.createdAt.toISOString().replace('T', ' ').substring(0, 16),
      pickupDate: o.pickupDate,
      pickupSlot: o.pickupSlotTime,
      status: o.status,
      paymentMethod: o.paymentMethod,
      notes: o.notes
    }));

    return res.json({ success: true, data: formattedOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID or orderId
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const param = req.params.id;
    let query = {};

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = param;
    } else {
      query.orderId = param;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security check: Student can only view own order
    if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({
      success: true,
      data: {
        _id: order._id,
        id: order.orderId,
        orderId: order.orderId,
        userEmail: order.userEmail,
        userName: order.userName,
        items: order.items,
        totalAmount: order.totalAmount,
        orderDate: order.createdAt.toISOString().replace('T', ' ').substring(0, 16),
        pickupDate: order.pickupDate,
        pickupSlot: order.pickupSlotTime,
        status: order.status,
        paymentMethod: order.paymentMethod,
        notes: order.notes
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const param = req.params.id;
    let query = param.match(/^[0-9a-fA-F]{24}$/) ? { _id: param } : { orderId: param };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // If order was cancelled and was not previously cancelled, release slot capacity
    if (status === 'Cancelled' && oldStatus !== 'Cancelled' && order.pickupSlotTime) {
      await PickupSlot.findOneAndUpdate(
        { time: order.pickupSlotTime, bookedCount: { $gt: 0 } },
        { $inc: { bookedCount: -1 } }
      );
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        id: order.orderId,
        orderId: order.orderId,
        status: order.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
