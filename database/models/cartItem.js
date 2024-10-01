const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema({
  cartItems: { type: [CartItemSchema], required: true },
  orderNumber: { type: String, required: true },
  deliveredStatus: { type: String, required: true },
});

module.exports = mongoose.model("cartItem", OrderSchema);
