const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    title: String,
    menuType: Number,
    subMenus: [
      {
        title: String,
      },
    ],
  },
  { timestamps: true }
);

const MenuModel = mongoose.model("menu", menuSchema);

module.exports = MenuModel;
