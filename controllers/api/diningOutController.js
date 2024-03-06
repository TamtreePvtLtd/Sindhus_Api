/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const mongoose = require("mongoose");
const DiningOutModel = require("../../database/models/diningOut");
const MenuModel = require("../../database/models/menu");
const { SNACKS_MENU_TYPE } = require("../../constants/Constants");
const Fuse = require("fuse.js");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllDiningOutProducts = async (req, res, next) => {
  try {
    const diningOutProducts = await DiningOutModel.aggregate([
      {
        $unwind: "$menu",
      },
      {
        $lookup: {
          from: "menus",
          localField: "menu.mainMenuId",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      {
        $unwind: "$menuDetails",
      },
      {
        $lookup: {
          from: "products",
          localField: "menu.productIds",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$menu.mainMenuId",
          mainMenuId: { $first: "$menuDetails" },
          products: {
            $push: {
              _id: "$productDetails._id",
              title: "$productDetails.title",
              posterURL: { $ifNull: ["$productDetails.posterURL", ""] },
              dailyMenuSizeWithPrice: {
                $ifNull: ["$productDetails.dailyMenuSizeWithPrice", null],
              },
              price: "$productDetails.price",
            },
          },
        },
      },
      {
        $unwind: "$products", // Unwind the products array
      },
      {
        $sort: {
          "products.title": 1, // Sort the products by title in ascending order
        },
      },
      {
        $group: {
          _id: "$_id",
          mainMenuId: { $first: "$mainMenuId" },
          products: { $push: "$products" }, // Push the sorted products back into an array
        },
      },
      {
        $sort: { "mainMenuId.title": 1 }, // Sort the result by menu title
      },
      {
        $project: {
          _id: 0,
          menuDatas: {
            _id: "$mainMenuId._id",
            title: "$mainMenuId.title",
            products: "$products",
            menuType: "$mainMenuId.menuType",
          },
        },
      },
    ]);

    res.json(diningOutProducts);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllDiningOutMenuDatas = async (req, res, next) => {
  try {
    const menuItems = await DiningOutModel.aggregate([
      {
        $unwind: "$menu",
      },
      {
        $lookup: {
          from: "menus",
          localField: "menu.mainMenuId",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      {
        $project: {
          menuId: "$menu.mainMenuId",
          title: { $arrayElemAt: ["$menuDetails.title", 0] },
          image: { $arrayElemAt: ["$menuDetails.image", 0] },
        },
      },
      {
        $sort: { title: 1 },
      },
    ]);

    const cateringMenuData = menuItems.map((menuItem) => ({
      _id: menuItem.menuId,
      title: menuItem.title,
      image: menuItem.image,
    }));

    res.json(cateringMenuData);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.fetchProductsByMenuId = async (req, res, next) => {
  const { menuId } = req.params;

  try {
    const [diningOutProduct] = await DiningOutModel.aggregate([
      {
        $unwind: "$menu",
      },
      {
        $match: {
          "menu.mainMenuId": new mongoose.Types.ObjectId(menuId),
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "menu.mainMenuId",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      {
        $unwind: "$menuDetails",
      },
      {
        $lookup: {
          from: "products",
          localField: "menu.productIds",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$menu.mainMenuId",
          mainMenuId: { $first: "$menuDetails" },
          title: { $first: "$menuDetails.title" },
          image: { $first: "$menuDetails.image" },
          products: {
            $push: {
              _id: "$productDetails._id",
              title: "$productDetails.title",
              posterURL: { $ifNull: ["$productDetails.posterURL", ""] },
              price: "$productDetails.price",
              dailyMenuSizeWithPrice: {
                $ifNull: ["$productDetails.dailyMenuSizeWithPrice", null],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: "$mainMenuId._id",
          title: 1,
          image: 1,
          products: 1,
        },
      },
    ]);

    if (diningOutProduct) {
      const Product = {
        _id: diningOutProduct._id,
        title: diningOutProduct.title,
        image: diningOutProduct.image,
        products: diningOutProduct.products,
      };

      res.json(Product);
    } else {
      const diningOutMenuWithEmptyProduct = await MenuModel.findOne({
        _id: menuId,
      });

      if (diningOutMenuWithEmptyProduct) {
        const menuDetails = {
          _id: diningOutMenuWithEmptyProduct._id,
          title: diningOutMenuWithEmptyProduct.title,
          image: diningOutMenuWithEmptyProduct.image,
          products: [],
        };

        res.json(menuDetails);
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getDiningOutMenus = async (req, res, next) => {
  try {
    const menuItems = await DiningOutModel.find().populate({
      path: "menu.mainMenuId",
      select: "title menuType",
    });

    const menuData = menuItems
      .map((menuItem) =>
        menuItem.menu.map((menu) => ({
          _id: menu.mainMenuId._id,
          title: menu.mainMenuId.title,
          menuType: menu.mainMenuId.menuType,
        }))
      )
      .flat();

    res.json(menuData);
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

// exports.searchDiningOutProduct = async (req, res, next) => {
//   const { menuId } = req.params;
//   const { searchTerm } = req.query;
//   console.log(searchTerm);

//   try {
//     let matchQuery = {};

//     // if (!menuId && !searchTerm) {
//     //   return res.json([]); // Return here to prevent further execution
//     // }

//     if (menuId) {
//       matchQuery["menu.mainMenuId"] = new mongoose.Types.ObjectId(menuId);
//     }

//     const products = await DiningOutModel.aggregate([
//       {
//         $unwind: "$menu",
//       },
//       {
//         $match: matchQuery,
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "menu.productIds",
//           foreignField: "_id",
//           as: "product",
//         },
//       },

//       {
//         $unwind: "$product",
//       },
//       // {
//       //   $match: {
//       //     "product.title": { $regex: new RegExp(searchTerm, "i") },
//       //   },
//       // },
//       {
//         $group: {
//           _id: "$product._id",
//           title: { $first: "$product.title" },
//           posterURL: { $first: "$product.posterURL" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           posterURL: 1,
//         },
//       },
//     ]);

//     res.json(products);
//   } catch (error) {
//     next(error);
//   }
// };


exports.searchDiningOutProduct = async (req, res, next) => {
  const { menuId } = req.params;
  const { searchTerm } = req.query;
  console.log(searchTerm);
  try {
    let matchQuery = {};

    if (!menuId && !searchTerm) {
      res.json([]);
    }

    if (menuId) {
      matchQuery["menu.mainMenuId"] = new mongoose.Types.ObjectId(menuId);
    }

    const products = await DiningOutModel.aggregate([
      {
        $unwind: "$menu",
      },
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "products",
          localField: "menu.productIds",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      // {
      //   $match: {
      //     "product.title": { $regex: new RegExp(searchTerm, "i") },
      //   },
      // },
      {
        $group: {
          _id: "$product._id",
          title: { $first: "$product.title" },
          posterURL: { $first: "$product.posterURL" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          posterURL: 1,
        },
      },
    ]);

    const fuseOptions = {
      includeScore: true,
      threshold: 0.5,
      keys: ["title"],
      minMatchCharLength: 3,
    };

    const fuse = new Fuse(products, fuseOptions);
    const searchResults = searchTerm ? fuse.search(searchTerm) : products;
    console.log("fss", searchResults);
    res.json(searchResults);
  } catch (error) {
    next(error);
  }
};