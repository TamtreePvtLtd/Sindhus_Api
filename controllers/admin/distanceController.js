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
exports.getAllDistances = async (req, res, next) => {
  try {
    const data = await DistanceModel.find();

    res.json(data);
  } catch (error) {
    next(error);
  }
};
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

exports.getNearestDistance = async (req, res) => {
  try {
    // Get the distance parameter from the request
    const distance = parseFloat(req.params.distance);
    console.log("Requested distance:", distance);
    const distances = await DistanceModel.find({}).exec();
    console.log("All distances:", distances);

    // Find the first nearest greater distance
    const nearestGreaterDistance = await DistanceModel.find({
      uptoDistance: { $gt: distance }, // Find distances greater than the passed distance
    })
      .sort({ uptoDistance: 1 }) // Sort in ascending order to get the nearest greater distance
      .limit(1) // Limit the result to just the first document
      .exec();

    console.log("Query result:", nearestGreaterDistance);

    if (nearestGreaterDistance.length === 0) {
      return res.status(404).json({ message: "No greater distance found" });
    }

    // Send the nearest greater distance as a response
    res.json(nearestGreaterDistance[0]); // Return the first document
  } catch (error) {
    console.error("Error finding nearest greater distance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

