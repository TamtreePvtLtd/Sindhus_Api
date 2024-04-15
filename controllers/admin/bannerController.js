const { uploadToS3 } = require("../../config/s3Config");
const multer = require("multer");
const upload = multer();
const path = require("path");
const bannerModel = require("../../database/models/banner");

exports.createBanner = async (req, res, next) => {
  try {
    const formData = req.body;
   
    const posterImage = req.files.find(
      (file) => file.fieldname === "image"
    );
        const posterS3FileName = await uploadToS3(
          posterImage.buffer,
          posterImage.originalname,
          posterImage.mimetype
        );

    const posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;

    const newBanner = await bannerModel.create({
      title: formData.title,
      description: formData.description,
      pagetitle: formData.pagetitle,
      image: posterImageUrl,
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
    const { id } = req.params; 
    const formData = req.body;

    const { title, description, pagetitle, image } = formData;

    
    const updatedBanner = await bannerModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        pagetitle,
        image,
      },
      { new: true }
    ); 

    if (!updatedBanner) {
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
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedBanner = await bannerModel.deleteOne(
      { _id: id } // Construct filter object with id
    );

    if (deletedBanner.deletedCount === 0) {
      // Check if no banner was deleted
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      data: deletedBanner,
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

