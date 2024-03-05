const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    mobileNumber: String,
    message: String,
    guestCount: Number,
    typeOfEvent: String,
    eventDate: { type: Date },
    isResponse: Boolean,
  },
  { timestamps: true }
);

const EnquiryModel = mongoose.model("Enquiry", EnquirySchema);

module.exports = EnquiryModel;
