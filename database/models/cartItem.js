const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

module.exports = mongoose.model("CartItem", CartItemSchema);
