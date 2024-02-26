const mongoose = require("mongoose");

const specialsSchema = new mongoose.Schema(
  {
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const specialsModel = mongoose.model("specials", specialsSchema);

module.exports = specialsModel;
