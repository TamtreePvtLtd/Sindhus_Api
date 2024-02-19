/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const { SNACKS_MENU_TYPE } = require("../../constants/Constants");
const DiningOutModel = require("../../database/models/diningOut");
const MenuModel = require("../../database/models/menu");
const ProductModel = require("../../database/models/product");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createDiningOutProduct = async (req, res, next) => {
  try {
    const { menu } = req.body;

    const menuItems = [];
    for (const menuItem of menu) {
      const { menuId, productIds } = menuItem;
      const menuItemData = {
        mainMenuId: menuId,
        productIds: productIds,
      };
      menuItems.push(menuItemData);
    }

    const newDiningOutProduct = await DiningOutModel.create({
      menu: menuItems,
    });
       res.json({
      data: newDiningOutProduct,
      success: true,
      statusCode: 200,
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.updateDiningOutProduct = async (req, res, next) => {
  try {
    const diningOutId = req.params.diningOutId;

    if (!diningOutId) {
      const error = new Error("diningOut ID is required");
      error.statusCode = 411;
      throw error;
    }

    const { menu, removeMenuId, removeProductIds } = req.body;

    const menuItems = [];
    for (const menuItem of menu) {
      const { menuId, productIds } = menuItem;
      const menuItemData = {
        mainMenuId: menuId,
        productIds: productIds,
      };
      menuItems.push(menuItemData);
    }

    const updateMenuWithProducts = {
      menu: menuItems,
    };

    if (removeMenuId) {
      updateMenuWithProducts.$pull = { menu: { mainMenuId: removeMenuId } };
    }

    if (removeProductIds && removeMenuId) {
      updateMenuWithProducts.$pull = {
        menu: {
          mainMenuId: removeMenuId,
          productIds: { $in: removeProductIds },
        },
      };
    }

    const updatedDiningOutProduct = await DiningOutModel.findByIdAndUpdate(
      diningOutId,
      updateMenuWithProducts,
      { new: true }
    );

    if (!updatedDiningOutProduct) {
      const error = new Error("DiningOutProduct not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      data: updatedDiningOutProduct,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllDiningOutProductswithMenuData = async (req, res, next) => {
  try {
    const menus = await MenuModel.find({}, "_id title");
    
      menus.sort((a, b) => a.title.localeCompare(b.title));

    const products = await ProductModel.find(
      {
        "menu.mainMenuIds": { $in: menus.map((menu) => menu._id) },
      },
      "_id title posterURL  menu"
    );

    const diningOutProducts = menus.map((menu) => ({
      _id: menu._id,
      title: menu.title,
      products: products
        .filter(
          (product) =>
            product.menu &&
            product.menu.mainMenuIds &&
            product.menu.mainMenuIds.includes(menu._id)
        )
        .map((product) => ({
          _id: product._id,
          title: product.title,
          posterURL: product.posterURL,
        })),
    }));

    res.json(diningOutProducts);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.deleteDiningOutProduct = async (req, res, next) => {
  try {
    const { diningOutId } = req.params;
    if (!diningOutId) {
      const error = new Error("diningOut ID is required");
      error.statusCode = 411;
      throw error;
    }

    const product = await DiningOutModel.findById(diningOutId);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const deleteResult = await DiningOutModel.deleteOne({ _id: diningOutId });

    if (deleteResult.acknowledged == false && deleteResult.deletedCount <= 0) {
      const error = new Error("Error while delete product");
      error.statusCode = 521;
      throw error;
    }

    const success = deleteResult.acknowledged;
    const message = success
      ? "Product deleted successfully"
      : "Failed to delete product";

    res.json({
      success: success,
      message: message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllDiningOutMenuWithProductDatas = async (req, res, next) => {
  try {
    const diningOutItems = await DiningOutModel.find();
    res.json(diningOutItems);
  } catch (error) {
    next(error);
  }
};
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getDiningOutProductsByMenuId = async (req, res, next) => {
  const { menuId } = req.params;

  try {
    const products = await ProductModel.find(
      {
        "menu.mainMenuIds": menuId,
      },
      "title posterURL"
    );

    res.json({ products });
  } catch (error) {
    next(error);
  }
};
