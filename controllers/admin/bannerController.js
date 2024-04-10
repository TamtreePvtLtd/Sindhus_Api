const { uploadToS3 } = require("../../config/s3Config");
const multer = require("multer");
const upload = multer();
const path = require("path");
const bannerModel = require("../../database/models/banner");

exports.createBanner = async (req, res, next) => {
  try {
    const formData = req.body;

    const { title, image } = formData;

    const newBanner = await bannerModel.create({
      title,
      image,
    });

    res.status(200).json({
      data: newBanner,
      success: true,
      message: "Banner created successfully",
    });
  } catch (error) {
    next(error);
  }
};
