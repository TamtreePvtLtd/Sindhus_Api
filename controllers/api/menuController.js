/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const MenuModel = require("../../database/models/menu");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllMenus = async (req, res, next) => {
  try {
    const menuItems = await MenuModel.find();
    const menuData = menuItems.map((menuItem) => ({
      _id: menuItem._id,
      title: menuItem.title,
      menuType: menuItem.menuType,
    }));
    res.json(menuData);
  } catch (error) {
    next(error);
  }
};

exports.getAllMenusInCatering = async (req, res, next) => {
  try {
    const menuItems = await MenuModel.find();

    const filteredMenuData = menuItems.filter((menuItem) => {
      return (
        menuItem.title.toLowerCase() !== "snacks" &&
        menuItem.title.toLowerCase() !== "drinks"
      );
    });
    const menuData = filteredMenuData.map((menuItem) => ({
      _id: menuItem._id,
      title: menuItem.title,
      menuType: menuItem.menuType,
    }));

    // Send the filtered menu data in the response
    res.json(menuData);
  } catch (error) {
    next(error);
  }
};
