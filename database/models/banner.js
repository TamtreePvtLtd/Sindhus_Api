const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: Number,
    image: 
      {
        type: String,
      },
    
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const bannerModel = mongoose.model("banner", bannerSchema);

module.exports = bannerModel;
