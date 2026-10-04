const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    pickupSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupSlot'
    },
    pickupSlotTime: {
      type: String,
      required: true
    },
    pickupDate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
      default: 'Placed'
    },
    paymentMethod: {
      type: String,
      default: 'Counter Cash / UPI'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
