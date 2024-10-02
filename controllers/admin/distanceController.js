/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const DistanceModel = require("../../database/models/distance");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createDistance = async (req, res, next) => {
  try {
    const distanceData = req.body;

    const newDistanceDoc = await DistanceModel.create(distanceData);

    res.json({
      data: newDistanceDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
// exports.getAllDistances = async (req, res, next) => {
//   try {
//     const distances = await DistanceModel.find();

//     res.json({
//       distances,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
exports.updateDistance = async (req, res, next) => {
  try {
    const distanceId = req.params.id;

    const updatedDistance = await DistanceModel.findById(distanceId);

    if (!updatedDistance) {
      return res.status(404).json({
        success: false,
        message: "Distance not found",
        statusCode: 404,
      });
    }

    const updatedDistanceData = req.body;

    const updatedDistanceDoc = await DistanceModel.findByIdAndUpdate(
      distanceId,
      updatedDistanceData,
      { new: true }
    );

    res.json({
      data: updatedDistanceDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDistance = async (req, res, next) => {
  try {
    const distanceId = req.params.id;

    const deletedDistance = await DistanceModel.findById(distanceId);

    if (!deletedDistance) {
      return res.status(404).json({
        success: false,
        message: "Distance not found",
        statusCode: 404,
      });
    }

    await DistanceModel.deleteOne({ _id: distanceId });

    res.json({
      success: true,
      statusCode: 200,
      message: "Distance deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
