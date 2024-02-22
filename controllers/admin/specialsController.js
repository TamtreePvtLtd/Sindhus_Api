const specialsModel = require("../../database/models/specials");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.createSpecials = async (req, res, next) => {
  try {
      const { images } = req.body;
      
      const newSpecials = await specialsModel.create({ images });
      
    res.json({
      data: newSpecials,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
