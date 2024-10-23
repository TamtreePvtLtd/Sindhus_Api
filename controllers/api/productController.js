/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const mongoose = require("mongoose");
const ProductModel = require("../../database/models/product");
const {
  SNACKS_MENU_TYPE,
  OTHER_MENU_TYPE,
  DRINKS_MENU_TYPE,
} = require("../../constants/Constants");
const MenuModel = require("../../database/models/menu");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.fetchProductsByCateringMenu = async (req, res, next) => {
  const { menuId, productId } = req.query;
  try {
    const matchQuery = {};

    if (menuId) {
      matchQuery["menu.mainMenuIds"] = new mongoose.Types.ObjectId(menuId);
    }

    if (productId) {
      matchQuery["_id"] = new mongoose.Types.ObjectId(productId);
    }

    const totalMenus = await MenuModel.countDocuments({
      menuType: { $nin: [SNACKS_MENU_TYPE, DRINKS_MENU_TYPE] },
    });

    let aggregationPipeline;

    const commonPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "menus",
          localField: "menu.mainMenuIds",
          foreignField: "_id",
          as: "menuItems",
        },
      },
      { $unwind: "$menuItems" },
      {
        $match: {
          "menuItems.menuType": { $eq: OTHER_MENU_TYPE },
          "menuItems._id": menuId
            ? new mongoose.Types.ObjectId(menuId)
            : { $exists: true },
        },
      },
      {
        $group: {
          _id: "$menuItems._id",
          menuTitle: { $first: "$menuItems.title" },
          products: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              servingSizeDescription: "$servingSizeDescription",
              posterURL: "$posterURL",
              cateringMenuSizeWithPrice: "$cateringMenuSizeWithPrice",
            },
          },
        },
      },
      { $sort: { menuTitle: 1 } },
    ];

    if (productId && !menuId) {
      aggregationPipeline = [
        ...commonPipeline,
        {
          $group: {
            _id: null,
            items: {
              $push: {
                _id: "$_id",
                menuTitle: "$menuTitle",
                products: "$products",
              },
            },
          },
        },
      ];
    } else {
      aggregationPipeline = [...commonPipeline];
    }

    if (menuId == "" && productId == "" && req.query.page > 0) {
      aggregationPipeline.push({
        $skip: (parseInt(req.query.page) - 1) * 1,
      });

      aggregationPipeline.push({
        $limit: 1,
      });
    }

    const aggregatedData = await ProductModel.aggregate(aggregationPipeline);

    const totalItems = aggregatedData.length;

    res.json({
      items: productId && !menuId ? aggregatedData[0].items : aggregatedData,
      pageInfo: {
        page: parseInt(req.query.page) || 0,
        pageSize: 1,
        totalPages: totalMenus,
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.searchProduct = async (req, res, next) => {
  const { menuId } = req.params;
  const { searchTerm } = req.query;

  try {
    let matchQuery = {};

    if (!menuId && !searchTerm) {
      res.json([]);
    }

    if (menuId) {
      matchQuery["menu.mainMenuIds"] = new mongoose.Types.ObjectId(menuId);
    }

    if (searchTerm) {
      matchQuery["title"] = { $regex: searchTerm, $options: "i" };
    }

    const products = await ProductModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $project: {
          title: 1,
          posterURL: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.getAllSnacksMenu = async (req, res, next) => {
  const { subMenuId } = req.params;

  try {
    const subMenus = await MenuModel.aggregate([
      {
        $match: {
          menuType: SNACKS_MENU_TYPE,
        },
      },
      {
        $unwind: "$subMenus",
      },
      {
        $project: {
          _id: "$subMenus._id",
          title: "$subMenus.title",
        },
      },
    ]);

    const snacksProducts = await ProductModel.aggregate([
      {
        $lookup: {
          from: "menus",
          localField: "menu.mainMenuIds",
          foreignField: "_id",
          as: "mainMenus",
        },
      },
      {
        $unwind: "$mainMenus",
      },
      {
        $match: {
          "mainMenus.menuType": SNACKS_MENU_TYPE,
          ...(subMenuId && {
            "menu.subMenuIds": new mongoose.Types.ObjectId(subMenuId),
          }),
        },
      },
      {
        $group: {
          _id: "$mainMenus.subMenus._id",
          products: {
            $push: {
              _id: "$_id",
              title: "$title",
              posterURL: "$posterURL",
              itemSizeWithPrice: "$itemSizeWithPrice",
              availability: "$availability",
            },
          },
        },
      },
      {
        $project: {
          products: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ subMenus, products: snacksProducts[0]?.products || [] });
  } catch (error) {
    next(error);
  }
};


/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.fetchProductById = async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    const error = new Error("ProductID is required");
    error.statusCode = 411;
    throw error;
  }

  try {
    const product = await ProductModel.findById(productId);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 411;
      throw error;
    }

    res.json({
      data: product,
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
exports.getCateringBag = async (req, res, next) => {
  try {
    const selectedProductIds = req.body;
    const products = await ProductModel.find({
      _id: { $in: selectedProductIds },
    });
    const productInfo = products.map((product) => ({
      _id: product._id,
      title: product.title,
      posterURL: product.posterURL,
    }));
    res.json(productInfo);
  } catch (error) {
    next(error);
  }
};
