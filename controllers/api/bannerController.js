/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const BANNER = {
  HOME_BANNER: 1,
  MENUCARD_BANNER: 2,
  DININGOUT_BANNER: 3,
  SNACKS_BANNER: 4,
};

const bannerModel = require("../../database/models/banner");

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

exports.getPageTitle = async (req, res, next) => {
  // try {
  //   const bannerType = parseInt(req.params.bannerType);
  //   console.log("Requested Banner Type:", bannerType);

  //   // Check if the banner type exists in the BANNER object
  //   if (!BANNER.hasOwnProperty(bannerType)) {
  //     console.log("Banner not found in BANNER object");
  //     return res.status(404).json({
  //       success: false,
  //       message: "Banner not found",
  //     });
  //   }

  //   const pageTitle = BANNER[bannerType].title;
  //   const image = BANNER[bannerType].image;
  //   const description = BANNER[bannerType].description;

  //   console.log("Page Title:", pageTitle);

  //   res.status(200).json({
  //     pageTitle,
  //     description,
  //     image,
  //     success: true,
  //     message: "Page details retrieved successfully",
  //   });
  // } catch (error) {
  //   next(error);
  // }

  try {
    const pagetitle = req.params.pagetitle;

    const banner = await bannerModel.findOne({ pagetitle });

    if (!banner) {
      return null;
    }
    res.status(200).json(banner);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
