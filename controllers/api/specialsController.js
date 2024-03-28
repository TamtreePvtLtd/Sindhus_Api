const specialsModel = require("../../database/models/specials");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllSpecials = async (req, res, next) => {
  try {
    const allSpecials = await specialsModel.find();

    res.json({
      data: allSpecials,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
