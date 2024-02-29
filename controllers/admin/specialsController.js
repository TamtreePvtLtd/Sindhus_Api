const specialsModel = require("../../database/models/specials");
const path = require("path");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.createSpecials = async (req, res, next) => {
  try {
    const { images } = req.body;

    // Extract the data property from each image object
    const imageStrings = images.map((image) => image.data);

    // Save the array of strings to the database
    const newSpecials = await specialsModel.create({ images: imageStrings });

    res.json({
      data: newSpecials,
      success: true,
      statusCode: 200,
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
    const { images } = special ;

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
