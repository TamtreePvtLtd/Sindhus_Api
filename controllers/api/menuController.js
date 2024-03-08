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
    let menusQuery = { menuType: MENU_TYPES.OTHER_MENU_TYPE };

    // If menu ID is provided in request query, filter menus by that ID
    if (req.query.menuId) {
      menusQuery._id = req.query.menuId;
    }

    // Find menus based on the query
    const menus = await MenuModel.find(menusQuery);

    console.log("Number of menus found:", menus.length);

    // Initialize an array to store formatted menu data with associated products
    const formattedMenus = [];

    // Loop through each menu
    for (const menu of menus) {
      let productsQuery = { "menu.mainMenuIds": menu._id };

      // If menu ID is provided, only fetch products for that menu
      if (req.query.menuId) {
        productsQuery["menu.mainMenuIds"] = req.query.menuId;
      }

      // Retrieve products associated with the current menu
      const products = await ProductModel.find(productsQuery);

      // Extract relevant data for the menu and associated products
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
          cateringMenuSizeWithPrice: product.cateringMenuSizeWithPrice || [],
          dailyMenuSizeWithPrice: product.dailyMenuSizeWithPrice || [],
        })),
      };

      // Push the formatted menu to the array
      formattedMenus.push(formattedMenu);
    }

    // Prepare the response
    const response = {
      data: formattedMenus,
      success: true,
      statusCode: 200,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
