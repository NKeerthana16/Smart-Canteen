const express = require('express');
const { getSlots, getSlotById, createSlot, updateSlot, deleteSlot } = require('../controllers/slotController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSlots);
router.get('/:id', getSlotById);
router.post('/', protect, adminOnly, createSlot);
router.put('/:id', protect, adminOnly, updateSlot);
router.delete('/:id', protect, adminOnly, deleteSlot);

module.exports = router;
