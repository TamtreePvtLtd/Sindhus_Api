/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const mongoose = require("mongoose");
const CateringUserModel = require("../../database/models/cateringUser");
const nodemailer = require("nodemailer");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.createCateringUser = async (req, res, next) => {
  try {
    const { userData, combinedProducts } = req.body;

    const cateringUser = {
      name: userData.name,
      phoneNumber: userData.mobileNumber,
      email: userData.email,
      eventName: userData.eventName,
      eventDate: new Date(userData.eventDate),
      eventTime: userData.eventTime,
    };

    const newUser = await CateringUserModel.create(cateringUser);
    const eventDate = new Date(userData.eventDate);
    const formattedDate = `${eventDate.toLocaleDateString()} `;
    var formattedTime = new Date(userData.eventTime).toLocaleTimeString({
      timeZone: "Asia/Kolkata",
    });
    const ampm = formattedTime.slice(-2).toUpperCase();
    formattedTime = formattedTime.slice(0, -2) + ampm;

    const productTableRows = [];

    combinedProducts.forEach((product) => {
      const sizeAndQuantity = product.quantities
        .map((sizeInfo) => {
          return `${sizeInfo.size}-${sizeInfo.quantity}`;
        })
        .join("<br/> ");

      productTableRows.push(`<tr>
        <td>${product.title}</td>
        <td>${sizeAndQuantity}</td>
        <td>${product.notes}</td>
      </tr>`);
    });

    const userDetailEmailContent = `
      <html>
        <body>
          <p>Full Name : ${userData.name}</p>
          <p >Phone Number : ${userData.mobileNumber}</p>
          <p >Email : ${userData.email}</p>
          <p>Event Name : ${userData.eventName}</p>
          <p>Event Date : ${formattedDate}</p>
          <p>Event Time : ${formattedTime}</p>

          <table style="border-collapse: collapse; width: 50%;" border="1">
            <thead>
              <tr>
                <th>Product Title</th>
                <th>Product Size with Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${productTableRows.join("")}
            </tbody>
          </table>
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

    const usersMailOptions = {
      to: process.env.TAMTREE_EMAIL,
      subject: "Customer Enquiry Request",
      html: userDetailEmailContent,
    };

    const thankYouEmailContent = `
      <html>
        <body>
          <p>Dear ${userData.name},</p>
          <p>Phone Number : ${userData.mobileNumber}</p>
          <p>Email : ${userData.email}</p>  
          <p>Event Name : ${userData.eventName}</p>
          <p>Event Date : ${formattedDate}</p>
          <p>Event Time : ${formattedTime}</p>

          <p>Thank you for your catering request. We have received your details and will get back to you shortly.</p> 
          <table style="border-collapse: collapse; width: 50%;" border="1">
            <thead>
              <tr>
                <th>Product Title</th>
                <th>Product Size with Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${productTableRows.join("")}
            </tbody>
          </table>  
        </body>
      </html>
    `;

    const thankYouMailOptions = {
      to: userData.email,
      subject: "Enquiry Request Received",
      html: thankYouEmailContent,
    };

    // Sending email to TAMTREE_EMAIL
    transporter.sendMail(usersMailOptions, (error, info) => {
      if (error) {
        console.error("TAMTREE_EMAIL mail error:", error);
      } else {
        console.log("TAMTREE_EMAIL mail sent: " + info.response);
      }
    });

    // Sending thank you email to userData.email
    transporter.sendMail(thankYouMailOptions, (error, info) => {
      if (error) {
        console.error("Thank you mail error:", error);
      } else {
        console.log("Thank you mail sent: " + info.response);
      }
    });

    res.json({
      data: newUser,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
