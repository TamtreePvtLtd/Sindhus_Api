const specialsModel = require("../../database/models/specials");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllSpecials = async (req, res, next) => {
  try {
    // Retrieve all specials from the database
    const allSpecials = await specialsModel.find();

    res.json({
      data: allSpecials,
      success: true,
      statusCode: 200,
    });
    console.log("allSpecials", allSpecials);
  } catch (error) {
    next(error);
  }
};
