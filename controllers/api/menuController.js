/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const MenuModel = require("../../database/models/menu");
const ProductModel = require("../../database/models/product");

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

exports.getMenuType3 = async (req, res, next) => {
  try {
    let menusQuery = {};

    if (req.query.menuId) {
      menusQuery._id = req.query.menuId;
    } else {
      menusQuery.menuType = MENU_TYPES.OTHER_MENU_TYPE;
    }

    const menus = await MenuModel.find(menusQuery);
    const allmenu = await MenuModel.find({
      menuType: MENU_TYPES.OTHER_MENU_TYPE,
    });

    const formattedMenus = { menus: [], MenusWithProduct: [] };

    const allMenus = allmenu.map((menu) => ({
      _id: menu._id,
      title: menu.title,
      image: menu.image,
      description: menu.description,
    }));

    formattedMenus.menus = [...allMenus];

    for (const menu of menus) {
      let productsQuery = { "menu.mainMenuIds": menu._id };
      const products = await ProductModel.find(productsQuery);
      const formattedMenu = {
        title: menu.title,
        image: menu.image,
        description: menu.description,
        products: products.map((product) => {
          const dailyMenuSizeWithPriceCondition =
            product.dailyMenuSizeWithPrice.length > 0 &&
            product.cateringMenuSizeWithPrice.length > 0;

          return {
            _id: product._id,
            title: product.title,
            servingSizeDescription: product.servingSizeDescription,
            dailyMenuSizeWithPrice: dailyMenuSizeWithPriceCondition
              ? product.dailyMenuSizeWithPrice
              : [],

            ...(dailyMenuSizeWithPriceCondition
              ? {}
              : {
                  cateringMenuSizeWithPrice:
                    product.cateringMenuSizeWithPrice || [],
                }),
          };
        }),
      };

      formattedMenus.MenusWithProduct.push(formattedMenu);
    }

    res.json(formattedMenus);
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

    res.json(menuData);
  } catch (error) {
    next(error);
  }
};
