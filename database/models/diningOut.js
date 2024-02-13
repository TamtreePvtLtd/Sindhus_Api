const mongoose = require("mongoose");
const MenuModel = require("./menu");
const ProductModel = require("./product");

const diningOutSchema = new mongoose.Schema(
  {
   menu: [
      {
        mainMenuId: { type: mongoose.Schema.Types.ObjectId, ref: MenuModel },
        productIds: [
          { type: mongoose.Schema.Types.ObjectId, ref: ProductModel },
        ],
      },
    ],
  },
  { timestamps: true }
);

const DiningOutModel = mongoose.model("diningOut", diningOutSchema);

module.exports = DiningOutModel;
