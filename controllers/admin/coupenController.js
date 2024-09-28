/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const CoupenModel = require("../../database/models/coupen");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createCoupen = async (req, res, next) => {
  try {
    const coupenData = req.body;

    const newCoupenDoc = await CoupenModel.create(coupenData);

    res.json({
      data: newCoupenDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupen = async (req, res, next) => {
  try {
    const coupenId = req.params.id;

    const existingCoupen = await CoupenModel.findById(coupenId);

    if (!existingCoupen) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        statusCode: 404,
      });
    }

    const updatedCoupenData = req.body;

    const updatedCoupenDoc = await CoupenModel.findByIdAndUpdate(
      coupenId,
      updatedCoupenData,
      { new: true }
    );

    res.json({
      data: updatedCoupenDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupen = async (req, res, next) => {
  try {
    const coupenId = req.params.id;

    const existingCoupen = await CoupenModel.findById(coupenId);

    if (!existingCoupen) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        statusCode: 404,
      });
    }

    await CoupenModel.deleteOne({ _id: coupenId });

    res.json({
      success: true,
      statusCode: 200,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCoupens = async (req, res, next) => {
  try {
    const coupenData = await CoupenModel.find();

    res.json({
      data: coupenData,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
