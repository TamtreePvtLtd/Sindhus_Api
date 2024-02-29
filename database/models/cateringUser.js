const mongoose = require("mongoose");

const cateringUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  eventName: String,
  eventDate: { type: Date },
  eventTime: {
    type: String,
    required: true,
  },
  
});

const CateringUserModel = mongoose.model("cateringUser", cateringUserSchema);

module.exports = CateringUserModel;
