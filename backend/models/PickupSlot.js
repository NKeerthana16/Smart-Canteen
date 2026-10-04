const mongoose = require('mongoose');

const pickupSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    time: {
      type: String,
      required: [true, 'Slot time range string is required'],
      trim: true
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      default: 10,
      min: [1, 'Capacity must be at least 1']
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: [0, 'Booked count cannot be negative']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for remaining capacity
pickupSlotSchema.virtual('remainingCapacity').get(function () {
  const rem = this.maxCapacity - this.bookedCount;
  return rem > 0 ? rem : 0;
});

// Virtual property for fullness status string
pickupSlotSchema.virtual('slotStatus').get(function () {
  return this.bookedCount >= this.maxCapacity ? 'SLOT FULL' : 'Available';
});

module.exports = mongoose.model('PickupSlot', pickupSlotSchema);
