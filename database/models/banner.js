const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    pagetitle: Number,
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const bannerModel = mongoose.model("banner", bannerSchema);

module.exports = bannerModel;
