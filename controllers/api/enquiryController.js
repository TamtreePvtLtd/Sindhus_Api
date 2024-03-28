/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const EnquiryModel = require("../../database/enquiry");
const nodemailer = require("nodemailer");
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createEnquiry = async (req, res, next) => {
  try {
    const enquiryData = req.body;

    const enquiry = {
      fullName: enquiryData.fullName,
      email: enquiryData.email,
      mobileNumber: enquiryData.mobileNumber,
      message: enquiryData.message,
      guestCount: enquiryData.guestCount,
      typeOfEvent: enquiryData.typeOfEvent,
      eventDate: new Date(enquiryData.eventDate),
    };

    const newEnquiry = await EnquiryModel.create(enquiry);
    const eventDate = new Date(enquiryData.eventDate);

    const formattedDate = `${eventDate.toLocaleDateString()} `;

    const eventDetailEmailContent = `
      <html>
        <body>
         
          <p>Full Name: ${enquiryData.fullName}</p>
          <p>Email: ${enquiryData.email}</p>
          <p>Mobile Number: ${enquiryData.mobileNumber}</p>
          <p>Message: ${enquiryData.message}</p>
          <p>Guest Count: ${enquiryData.guestCount}</p>
          <p>Type of Event: ${enquiryData.typeOfEvent}</p>
          <p>Event Date: ${formattedDate}</p>
        </body>
      </html>
    `;

    const enquiryThanksReplyEmailContent = `
      <html>
        <body>
          <p>Thank you for your enquiry. We have received your enquiry.</p>
        </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.TAMTREE_EMAIL,
        pass: process.env.TAMTREE_EMAIL_PASSWORD,
      },
    });
    const sindhusMailOption = {
      from: process.env.TAMTREE_EMAIL,
      subject: "Enquiry Request Received",
      to: enquiryData.email,
      html: enquiryThanksReplyEmailContent,
    };
    const usersMailOptions = {
      from: enquiryData.email,
      subject: "Customer Enquiry Request",
      to: process.env.TAMTREE_EMAIL,
      html: eventDetailEmailContent,
    };

    transporter.sendMail(sindhusMailOption, (error, info) => {
      if (error) {
        console.error("Sindhu's Email send error:", error);
      } else {
        console.log("Sindhu's Email sent: " + info.response);
      }
    });

    transporter.sendMail(usersMailOptions, (error, info) => {
      if (error) {
        console.error("user's Email send error:", error);
      } else {
        console.log("user's Email sent: " + info.response);
      }
    });

    res.json({
      data: newEnquiry,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
