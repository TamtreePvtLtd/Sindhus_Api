/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const bannerModel = require('../../database/models/banner');




/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.getAllBanners = async (req, res, next) => {
  try {
    
    const banners = await bannerModel.find();

        res.status(200).json({
      data: banners,
      success: true,
      message: "Banners retrieved successfully",
    });
  } catch (error) {
        next(error);
  }
};
