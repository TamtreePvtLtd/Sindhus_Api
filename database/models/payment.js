const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  deliveryOption: {
    type: String,
    enum: ["delivery", "pickup"],
    required: true,
  },
  amount: { type: Number, required: true },
  postalCode: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, required: true },
  deliveryDate: { type: Date, required: true }, // Add the date field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
