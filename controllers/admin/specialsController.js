const specialsModel = require("../../database/models/specials");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

const { uploadToS3, deleteFromS3 } = require("../../config/s3Config");
// const uploadToS3 = require("./uploadToS3"); // Assuming you have a function to upload files to S3
const multer = require("multer");
const upload = multer();
const path = require("path");

exports.createSpecials = async (req, res, next) => {
  try {
    const { images } = req.body;

    
    const s3ImageUrls = await Promise.all(
      images.map(async (image) => {
        const s3FileName = await uploadToS3(
          image.data.buffer, 
          image.originalname, 
          image.mimetype 
        );
        const url = `${process.env.BUCKET_URL}${s3FileName}`;
        return url;
      })
    );

    // Save the array of S3 image URLs to the database
    const newSpecials = await specialsModel.create({ images: s3ImageUrls });

    res.json({
      data: newSpecials,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};


