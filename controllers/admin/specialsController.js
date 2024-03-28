const specialsModel = require("../../database/models/specials");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

const { uploadToS3, deleteFromS3 } = require("../../config/s3Config");
const multer = require("multer");
const upload = multer();
const path = require("path");

exports.createSpecials = async (req, res, next) => {
  try {
    const images = req.files.filter((file) =>
      file.fieldname.startsWith("image")
    );

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

    const { name } = req.body;

    const newSpecials = await specialsModel.create({
      name: name,
      images: s3ImageUrls,
      created_at: new Date(),
    });

    const dateOnly = newSpecials.created_at.toLocaleDateString();

    res.json({
      data: { created_at: dateOnly },
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAllSpecials = async (req, res, next) => {
  try {
    const allSpecials = await specialsModel.find();

    for (const special of allSpecials) {
      const { images } = special;

      if (images && images.length > 0) {
        for (const url of images) {
          if (url) {
            await deleteImageFromS3(url);
          }
        }
      }

      await special.remove();
    }

    res.json({
      success: true,
      message: "All specials deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSpecial = async (req, res, next) => {
  try {
    const { specialId } = req.params;

    const special = await specialsModel.findById(specialId);

    if (!special) {
      const error = new Error("Special not found");
      error.statusCode = 404;
      throw error;
    }
    const { images } = special;

    if (images && images.length > 0) {
      for (const url of images) {
        if (url) {
          await deleteImageFromS3(url);
        }
      }
    }

    await specialsModel.findByIdAndDelete(specialId);

    res.json({
      success: true,
      message: "Special deleted successfully",
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
