/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const EnquiryModel = require("../../database/enquiry");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.getAllEnquiries = async (req, res, next) => {
  try {
    req.paginationResult.items = await req.paginationResult.items.sort({
      createdAt: -1,
    });
    res.json(req.paginationResult);
  } catch (error) {
    next(error);
  }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    if (!enquiryId) {
      const error = new Error("enquiry Id is required");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await EnquiryModel.findById(enquiryId);

    if (!enquiry) {
      const error = new Error("enquiry not found");
      error.statusCode = 404;
      throw error;
    }

    const deleteEnquiry = await EnquiryModel.deleteOne({ _id: enquiryId });

    const success = deleteEnquiry.acknowledged;
    const message = success
      ? "Enquiry deleted successfully"
      : "Failed to delete Enquiry";

    res.json({
      success: success,
      message: message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeEnquiryisResponseStatus = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    const enquiry = await EnquiryModel.findById(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    await EnquiryModel.findByIdAndUpdate(enquiryId, {
      isResponse: !enquiry.isResponse,
    });

    return res.json({
      message: "Enquiry status updated successfully.",
      success: false,
      statusCode: 520,
    });
  } catch (error) {
    next(error);
  }
};
