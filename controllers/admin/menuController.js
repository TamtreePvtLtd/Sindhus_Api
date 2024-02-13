/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const mongoose = require("mongoose");
const path = require("path");
const MenuModel = require("../../database/models/menu");
const { deleteFromS3 } = require("../../config/s3Config");
const DiningOutModel = require("../../database/models/diningOut");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createMenu = async (req, res, next) => {
  try {
    const formData = req.body;

    const subMenus = formData.subMenus || [];
    const submenuItems = [];

    for (const submenuItem of subMenus) {
      const subMenuItemData = {
        title: submenuItem.title.trim(),
      };
      submenuItems.push(subMenuItemData);
    }
    var newMenuDoc = await MenuModel.create({
      title: formData.title.trim(),

      menuType: formData.menuType,

      subMenus: submenuItems,
    });

    res.json({
      data: newMenuDoc,
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

exports.updateMenu = async (req, res, next) => {
  try {
    const menuId = req.params.menuId;

    if (!menuId) {
      const error = new Error("Menu ID is required");
      error.statusCode = 400;
      throw error;
    }

    const formData = req.body;

    if (!formData) {
      const error = new Error("FormData not found");
      error.statusCode = 400;
      throw error;
    }

    var menuImageS3Location = req.file;

    const existMenuItem = await MenuModel.findById(menuId);

    if (!existMenuItem) {
      const error = new Error("Menu not found");
      error.statusCode = 404;
      throw error;
    }

    let updateSubmenuItems = [];

    if (formData.subMenus) {
      updateSubmenuItems = formData.subMenus.map((submenuItem) => {
        const updatedSubmenuItem = {
          title: submenuItem.title,
          description: submenuItem.description,
        };
        return updatedSubmenuItem;
      });
    }
    var updatedMenuData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      menuType: formData.menuType,
      subMenus: updateSubmenuItems,
    };

    if (req.file) {
      updatedMenuData = {
        ...updatedMenuData,
        image: menuImageS3Location ? menuImageS3Location.location : null,
      };
    }

    const updatedMenuItem = await MenuModel.findByIdAndUpdate(
      menuId,
      updatedMenuData,
      { new: true }
    );

    if (formData.menuRemoveImage) {
      const decodedPath = decodeURIComponent(formData.menuRemoveImage);
      var key = path.basename(decodedPath);
      await deleteImageFromS3(key);
    }

    res.json({
      data: updatedMenuItem,
      success: true,
      message: "Menu updated successfully",
    });
  } catch (error) {
    if (req.file) {
      await deleteImageFromS3(req.file.key);
    }
    next(error);
  }
};

const deleteImageFromS3 = async (key) => {
  try {
    if (key) {
      await deleteFromS3(key);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.deleteMenu = async (req, res, next) => {
  try {
    const { menuId } = req.params;

    if (!menuId) {
      const error = new Error("Menu ID is required");
      error.statusCode = 400;
      throw error;
    }

    const menu = await MenuModel.findById(menuId);

    if (!menu) {
      const error = new Error("Menu not found");
      error.statusCode = 404;
      throw error;
    }

    const { image } = menu;

    const deleteMenu = await MenuModel.deleteOne({ _id: menuId });

    const diningOutMenu = await DiningOutModel.findOne({
      "menu.mainMenuId": menuId,
    });

    if (diningOutMenu) {
      await DiningOutModel.updateOne(
        { _id: diningOutMenu._id },
        { $pull: { menu: { mainMenuId: menuId } } }
      );
    }

    const success = deleteMenu.acknowledged;
    const message = success
      ? "Menu deleted successfully"
      : "Failed to delete menu";

    if (image) {
      const decodedPath = decodeURIComponent(image);
      var key = path.basename(decodedPath);
      await deleteImageFromS3(key);
    }

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

exports.adminGetAllMenus = async (req, res, next) => {
  try {
    req.paginationResult.items = await req.paginationResult.items;

    res.json(req.paginationResult);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.adminGetAllMenusForAddProduct = async (req, res, next) => {
  try {
    const menus = await MenuModel.find();

    res.json(menus);
  } catch (error) {
    next(error);
  }
};
