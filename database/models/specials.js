const mongoose = require("mongoose");

const specialsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const specialsModel = mongoose.model("specials", specialsSchema);

module.exports = specialsModel;
