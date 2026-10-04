const PickupSlot = require('../models/PickupSlot');

// @desc    Get all pickup slots with dynamic remaining capacity calculation
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res) => {
  try {
    const slots = await PickupSlot.find({ status: 'active' }).sort({ createdAt: 1 });
    
    // Map slots to match frontend structure with remaining and status fields
    const formattedSlots = slots.map(slot => {
      const remaining = slot.maxCapacity - slot.bookedCount;
      return {
        _id: slot._id,
        id: slot._id,
        time: slot.time,
        maxCapacity: slot.maxCapacity,
        bookedCount: slot.bookedCount,
        remaining: remaining > 0 ? remaining : 0,
        status: slot.bookedCount >= slot.maxCapacity ? 'SLOT FULL' : 'Available',
        active: slot.status === 'active'
      };
    });

    return res.json({ success: true, data: formattedSlots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get slot by ID
// @route   GET /api/slots/:id
// @access  Public
const getSlotById = async (req, res) => {
  try {
    const slot = await PickupSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Pickup slot not found' });
    }
    const remaining = slot.maxCapacity - slot.bookedCount;
    return res.json({
      success: true,
      data: {
        _id: slot._id,
        id: slot._id,
        time: slot.time,
        maxCapacity: slot.maxCapacity,
        bookedCount: slot.bookedCount,
        remaining: remaining > 0 ? remaining : 0,
        status: slot.bookedCount >= slot.maxCapacity ? 'SLOT FULL' : 'Available',
        active: slot.status === 'active'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new pickup slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res) => {
  try {
    const { time, maxCapacity } = req.body;

    if (!time || !maxCapacity) {
      return res.status(400).json({ success: false, message: 'Time range and maximum capacity are required' });
    }

    const existing = await PickupSlot.findOne({ time });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slot with this time range already exists' });
    }

    const slot = await PickupSlot.create({
      time,
      maxCapacity: parseInt(maxCapacity),
      bookedCount: 0,
      status: 'active'
    });

    return res.status(201).json({ success: true, message: 'Pickup slot created successfully', data: slot });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update pickup slot
// @route   PUT /api/slots/:id
// @access  Private/Admin
const updateSlot = async (req, res) => {
  try {
    const { time, maxCapacity, status } = req.body;
    const slot = await PickupSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Pickup slot not found' });
    }

    if (time) slot.time = time;
    if (maxCapacity !== undefined) slot.maxCapacity = parseInt(maxCapacity);
    if (status) slot.status = status;

    const updatedSlot = await slot.save();
    return res.json({ success: true, message: 'Pickup slot updated successfully', data: updatedSlot });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete pickup slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
  try {
    const slot = await PickupSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Pickup slot not found' });
    }

    await slot.deleteOne();
    return res.json({ success: true, message: 'Pickup slot deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot
};
