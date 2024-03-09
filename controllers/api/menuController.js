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

// exports.getMenuType3 = async (req, res, next) => {
//   const menuId = req.query.menuId;
//   try {
//     const menus = await MenuModel.find({
//       menuType: MENU_TYPES.OTHER_MENU_TYPE,
//     });

//     console.log("Number of menus found:", menus.length);

//     const allMenus = {
//       menus: menus.map((menu) => ({
//         _id: menu._id,
//         title: menu.title,
//       })),
//     };

//     const menuWithProducts = [];

//     for (const menu of menus) {
//       const products = await ProductModel.find({
//         "menu.mainMenuIds": menuId,
//       });

//       const formattedMenu = {
//         title: menu.title,
//         id: menu._id,
//         products: products.map((product) => ({
//           _id: product._id,
//           title: product.title,
//           servingSizeDescription: product.servingSizeDescription,
//           cateringMenuSizeWithPrice: product.cateringMenuSizeWithPrice || [],
//           dailyMenuSizeWithPrice: product.dailyMenuSizeWithPrice || [],
//         })),
//       };

//       menuWithProducts.push(formattedMenu);
//     }

//     res.json({ menus: allMenus.menus, menuWithProducts: menuWithProducts });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getMenuType3 = async (req, res, next) => {
  try {
    let menusQuery = {};

    // If menu ID is provided in request query, filter menus by that ID
    if (req.query.menuId) {
      menusQuery._id = req.query.menuId;
    } else {
      menusQuery.menuType = MENU_TYPES.OTHER_MENU_TYPE;
    }

    // Find menus based on the query
    const menus = await MenuModel.find(menusQuery);

    const allmenu = await MenuModel.find();
    console.log("Number of menus found:", menus.length);

    // Initialize an array to store formatted menu data with associated products
    const formattedMenus = { menus: [], MenusWithProduct: [] };

    // Always populate all menus
    const allMenus = allmenu.map((menu) => ({
      _id: menu._id,
      title: menu.title,
      image: menu.image,
      description: menu.description,
    }));

    formattedMenus.menus = [...allMenus]; // Spread the elements of allMenus into formattedMenus

    for (const menu of menus) {
      let productsQuery = { "menu.mainMenuIds": menu._id };
      const products = await ProductModel.find(productsQuery);

      const formattedMenu = {
        title: menu.title,
        image: menu.image,
        description: menu.description,
        products: products.map((product) => ({
          _id: product._id,
          title: product.title,
          servingSizeDescription: product.servingSizeDescription,
          cateringMenuSizeWithPrice: product.cateringMenuSizeWithPrice || [],
          dailyMenuSizeWithPrice: product.dailyMenuSizeWithPrice || [],
        })),
      };

      formattedMenus.MenusWithProduct = formattedMenu;
    }

    res.json(formattedMenus);
  } catch (error) {
    next(error);
  }
};
