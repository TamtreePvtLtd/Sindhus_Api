const mongoose = require("mongoose");
const MenuModel = require("./menu");

const productSchema = new mongoose.Schema(
  {
    title: String,
    itemSizeWithPrice: [
      {
        size: String,
        price: Number,
      },
    ],
    posterURL: String,
    images: [
      {
        type: String,
      },
    ],
    cateringMenuSizeWithPrice: [
      {
        size: String,
        price: Number,
        quantity: Number,
      },
    ],
    dailyMenuSizeWithPrice: [
      {
        size: String,
        price: Number,
      },
    ],
    servingSizeDescription: String,
    ingredients: String,
    description: String,
    availability: String,
    netWeight: Number,
    menu: {
      mainMenuIds: [{ type: mongoose.Schema.Types.ObjectId, ref: MenuModel }],
      subMenuIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: MenuModel.submenu },
      ],
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
