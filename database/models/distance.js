const mongoose = require("mongoose");

const distanceSchema = new mongoose.Schema({
  uptoDistance: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const DistanceModel = mongoose.model("distance", distanceSchema);

module.exports = DistanceModel;
