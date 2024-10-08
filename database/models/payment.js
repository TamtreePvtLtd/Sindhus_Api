const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  deliveryOption: {
    type: String,
    enum: ["Delivery", "Pickup"],
    required: true,
  },
  amount: { type: Number, required: true },
  postalCode: { type: Number, required: false },
  paymentId: { type: String, required: true },
  status: { type: String, required: true },
  deliveryDate: { type: Date, required: true }, // Add the date field
  createdAt: { type: Date, default: Date.now },
  orderNumber: { type: String, required: true },
  couponName: { type: String, required: false },
  totalWithoutCoupon: { type: String, required: false },
  totalWithCoupon: { type: String, required: false },
  addressURL: { type: String, required: false },
   notes: { type: String, required: false },
});

module.exports = mongoose.model("Transaction", transactionSchema);
