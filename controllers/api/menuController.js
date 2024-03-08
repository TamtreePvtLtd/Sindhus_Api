/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const MenuModel = require("../../database/models/menu");

const MENU_TYPES = {
  SNACKS_MENU_TYPE: 1,
  OTHER_MENU_TYPE: 2,
  DRINKS_MENU_TYPE: 3,
};
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

// exports.getMenuType3 = async (req, res, next) => {
//   try {
//     const menus = await MenuModel.find({
//       menuType: MENU_TYPES.OTHER_MENU_TYPE,
//     });
//     console.log("Number of menus found:", menus.length);

//     res.json({
//       data: menus,
//       success: true,
//       statusCode: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const ProductModel = require("../../database/models/product");
// const MenuModel = require("./menu");
// const { MENU_TYPES } = require("./constants"); // Assuming MENU_TYPES is defined in a separate file



exports.getMenuType3 = async (req, res, next) => {
  try {
    // Find menus of type OTHER_MENU_TYPE
    const menus = await MenuModel.find({
      menuType: MENU_TYPES.OTHER_MENU_TYPE,
    });

    console.log("Number of menus found:", menus.length);

    // Initialize an array to store formatted menu data with associated products
    const formattedMenus = [];

    // Loop through each menu
    for (const menu of menus) {
      // Retrieve products associated with the current menu
      const products = await ProductModel.find({
        "menu.mainMenuIds": menu._id,
      });

      // Extract relevant data for the menu
      const formattedMenu = {
        title: menu.title,
        image: menu.image,
        description: menu.description,
        products: products.map((product) => ({
          _id: product._id,
          title: product.title,
          price: product.price,
          posterURL: product.posterURL,
          description: product.description,
          servingSizeDescription: product.servingSizeDescription,
          ingredients: product.ingredients,
          netWeight: product.netWeight,
        })),
      };

      // Push the formatted menu to the array
      formattedMenus.push(formattedMenu);
    }

    res.json({
      data: formattedMenus,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};