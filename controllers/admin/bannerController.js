const { uploadToS3 } = require("../../config/s3Config");
const multer = require("multer");
const upload = multer();
const path = require("path");
const bannerModel = require("../../database/models/banner");

exports.createBanner = async (req, res, next) => {
  try {
    const formData = req.body;

    const { title, description, pagetitle, image } = formData;

    const newBanner = await bannerModel.create({
      title,
      description,
      pagetitle,
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


exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the ID is passed in the URL params
    const formData = req.body;

    const { title, description, pagetitle, image } = formData;

    // Find the banner by ID and update its fields
    const updatedBanner = await bannerModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        pagetitle,
        image,
      },
      { new: true }
    ); // { new: true } ensures that the updated document is returned

    if (!updatedBanner) {
      // If no banner was found with the given ID, return an error
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      data: updatedBanner,
      success: true,
      message: "Banner updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
