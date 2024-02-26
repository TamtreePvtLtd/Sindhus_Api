const specialsModel = require("../../database/models/specials");

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


