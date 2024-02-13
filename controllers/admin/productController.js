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
    const cateringMenuSizeWithPrice = JSON.parse(
      formData.cateringMenuSizeWithPrice
    );

    const dailyMenuSizeWithPrice = JSON.parse(formData.dailyMenuSizeWithPrice);

    // Upload poster image to S3 and get the S3 file name
    const posterS3FileName = await uploadToS3(
      posterImage.buffer,
      posterImage.originalname,
      posterImage.mimetype
    );
    const posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;

    // Upload each remaining image to S3 and get the S3 file name
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
      price: formData.price,
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

    // Filter the products based on the category
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
