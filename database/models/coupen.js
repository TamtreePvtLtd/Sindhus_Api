const mongoose = require("mongoose");

const coupenSchema = new mongoose.Schema({
  coupenName: {
    type: String,
    required: true,
  },
  coupenType: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  minAmount: {
    type: Number,
    required: true,
  },
  maxAmount: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    required: true,
  },
});

const CoupenModel = mongoose.model("coupen", coupenSchema);

module.exports = CoupenModel;
