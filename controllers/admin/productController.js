/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const { uploadToS3, deleteFromS3 } = require("../../config/s3Config");
const {
  PRODUCT_IMAGES_FIELDNAME,
  PRODUCT_POSTER_IMAGE,
} = require("../../constants/Constants");
const DiningOutModel = require("../../database/models/diningOut");
const ProductModel = require("../../database/models/product");
const multer = require("multer");
const upload = multer();
const path = require("path");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createProduct = async (req, res, next) => {
  try {
    const formData = req.body;
    const images = req.files.filter((file) =>
      file.fieldname.startsWith("image")
    );
    const posterImage = req.files.find(
      (file) => file.fieldname === "posterImage"
    );

    const menu = JSON.parse(formData.menu);

    const itemSizeWithPrice = JSON.parse(formData.itemSizeWithPrice);
    const cateringMenuSizeWithPrice = JSON.parse(
      formData.cateringMenuSizeWithPrice
    );

    const dailyMenuSizeWithPrice = JSON.parse(formData.dailyMenuSizeWithPrice);
    const posterS3FileName = await uploadToS3(
      posterImage.buffer,
      posterImage.originalname,
      posterImage.mimetype
    );
    const posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;
    const s3ImageUrls = await Promise.all(
      images.map(async (image) => {
        const s3FileName = await uploadToS3(
          image.buffer,
          image.originalname,
          image.mimetype
        );
        const url = `${process.env.BUCKET_URL}${s3FileName}`;
        return url;
      })
    );

    var newProductDoc = await ProductModel.create({
      title: formData.title,
      itemSizeWithPrice: itemSizeWithPrice,
      images: s3ImageUrls,
      cateringMenuSizeWithPrice: cateringMenuSizeWithPrice,
      dailyMenuSizeWithPrice: dailyMenuSizeWithPrice,
      description: formData.description,
      netWeight: parseInt(formData.netWeight) ?? 0,
      menu: {
        mainMenuIds: menu.mainMenuIds,
        subMenuIds: menu.subMenuIds,
      },
      posterURL: posterImageUrl,
      servingSizeDescription: formData.servingSizeDescription,
      ingredients: formData.ingredients,
      availability: false,
    });

    res.json({
      data: newProductDoc,
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

exports.updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const formData = req.body;
    const images = req.files.filter((file) =>
      file.fieldname.startsWith("image")
    );
    const posterImage = req.files.find(
      (file) => file.fieldname === "posterImage"
    );

    if (!productId) {
      const error = new Error("Product ID is required");
      error.statusCode = 411;
      throw error;
    }

    if (!formData) {
      const error = new Error("formData not found");
      error.statusCode = 446;
      throw error;
    }

    var product = await ProductModel.findById(productId);

    if (!product._id) {
      const error = new Error("Product is not found");
      error.statusCode = 459;
      throw error;
    }

    // Handle image removal
    const imagesToRemove = JSON.parse(formData.imagesToRemove || "[]");
    const remainingImages = product.images.filter(
      (img) => !imagesToRemove.includes(img)
    );

    if (imagesToRemove && imagesToRemove.length > 0) {
      for (const url of imagesToRemove) {
        if (url) {
          await deleteImageFromS3(url);
        }
      }
    }

    let posterImageUrl = product.posterURL;
    if (posterImage) {
      const posterS3FileName = await uploadToS3(
        posterImage.buffer,
        posterImage.originalname,
        posterImage.mimetype
      );
      posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;
    }

    const s3ImageUrls = await Promise.all(
      images.map(async (image) => {
        const s3FileName = await uploadToS3(
          image.buffer,
          image.originalname,
          image.mimetype
        );
        var url = `${process.env.BUCKET_URL}${s3FileName}`;
        return url;
      })
    );

    const updatedImages = [...remainingImages, ...s3ImageUrls];

    const menu = JSON.parse(formData.menu);
    const cateringMenuSizeWithPrice = JSON.parse(
      formData.cateringMenuSizeWithPrice
    );
    const dailyMenuSizeWithPrice = JSON.parse(formData.dailyMenuSizeWithPrice);
    const itemSizeWithPrice = JSON.parse(formData.itemSizeWithPrice);

    var updatedFields = {
      _id: formData.id,
      title: formData.title,
      description: formData.description,
      images: updatedImages,
      netWeight: parseInt(formData.netWeight) ?? 0,
      menu: {
        mainMenuIds: menu.mainMenuIds,
        subMenuIds: menu.subMenuIds,
      },
      price: formData.price,
      cateringMenuSizeWithPrice,
      dailyMenuSizeWithPrice,
      itemSizeWithPrice,
      posterURL: posterImageUrl,
      servingSizeDescription: formData.servingSizeDescription,
      ingredients: formData.ingredients,
    };

    const existingProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updatedFields },
      { new: true }
    );

    res.json({
      data: existingProduct,
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId);
    const { images, posterURL } = product;

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    await DiningOutModel.updateMany(
      { "menu.productIds": productId },
      { $pull: { "menu.$[].productIds": productId } }
    );

    const deleteResult = await ProductModel.deleteOne({ _id: productId });

    if (deleteResult.acknowledged == false && deleteResult.deletedCount <= 0) {
      const error = new Error("Error while delete product");
      error.statusCode = 521;
      throw error;
    }

    if (posterURL) {
      await deleteImageFromS3(posterURL);
    }

    if (images && images.length > 0) {
      for (const url of images) {
        if (url) {
          await deleteImageFromS3(url);
        }
      }
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

const deleteImageFromS3 = async (url) => {
  try {
    if (url) {
      const decodedPath = decodeURIComponent(url);
      var key = path.basename(decodedPath);
      await deleteFromS3(key);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getProductsByMenuId = async (req, res, next) => {
  try {
    const { menuId, subMenuId } = req.query;
    const menuItems = await ProductModel.find();
    const filteredProducts = menuItems.filter((product) => {
      if (subMenuId) {
        return (
          product.menu.mainMenuIds.includes(menuId) &&
          subMenuId.some((id) => product.menu.subMenuIds.includes(id))
        );
      } else {
        return product.menu.mainMenuIds.includes(menuId);
      }
    });

    res.json(filteredProducts);
  } catch (error) {
    next(error);
  }
};

exports.getAllProduct = async (req, res, next) => {
  try {
    const product = await ProductModel.find();

    res.json(product);
  } catch (error) {
    next(error);
  }
};
exports.adminGetAllProduct = async (req, res, next) => {
  try {
    req.paginationResult.items = await req.paginationResult.items;

    res.json(req.paginationResult);
  } catch (error) {
    next(error);
  }
};

exports.updateProductAvailability = async (req, res) => {
  try {
    const id = req.params.id; // Extract order ID from the URL
    const availability = req.body;
    console.log("req.body", req.body);

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    if (availability === undefined) {
      return res.status(400).json({ error: "Availability is required" });
    }

    // Find the order by ID and update the delivered status
    const product = await ProductModel.findOneAndUpdate(
      { _id: id }, // Match the orderNumber
      availability, // Update the delivered status
      { new: true } // Return the updated document
    );

    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateHideProduct = async (req, res) => {
  try {
    const id = req.params.id; // Extract order ID from the URL
    const hideProduct = req.body;
    console.log("req.body", req.body);

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    if (hideProduct === undefined) {
      return res
        .status(400)
        .json({ error: "hideProduct Availability is required" });
    }

    // Find the order by ID and update the delivered status
    const product = await ProductModel.findOneAndUpdate(
      { _id: id }, // Match the orderNumber
      hideProduct, // Update the delivered status
      { new: true } // Return the updated document
    );

    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};