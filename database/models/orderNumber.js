const mongoose = require("mongoose");

const orderchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
  },
});

const OrderModel = mongoose.model("order", orderchema);

module.exports = OrderModel;
