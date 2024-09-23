const CartItem = require("../../database/models/cartItem");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "deepa.tamtree@gmail.com",
    pass: "llbf upiq gaxj hqxy",
  },
});

exports.createCartItems = async (req, res) => {
  try {
    const { cartItems, paymentData } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    await CartItem.insertMany(cartItems);
    try {
      const cartItemsTable = cartItems
        .map(
          (item) => `
      <tr>
        <td>${item.title}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}</td>
      </tr>
    `
        )
        .join("");

      const paymentDataHtml = `
       <p><strong>First Name:</strong> ${paymentData.firstName}</p>
      <p><strong>Last Name:</strong> ${paymentData.lastName}</p>
      <p><strong>Delivery Date:</strong> ${new Date(
        paymentData.deliveryDate
      ).toLocaleDateString()}</p>
      <p><strong>  DeliveryOption:</strong> ${paymentData.deliveryOption}</p>
     <p><strong>Phone Number:</strong> ${paymentData.phoneNumber}</p>
     <p><strong>Address:</strong> ${paymentData.address}</p>
      <p><strong>Email:</strong> ${paymentData.email}</p>
      <p><strong>Amount:</strong> $${(paymentData.amount / 100).toFixed(2)}</p>
       <p><strong>Order Date:</strong> ${new Date(
         paymentData.createdAt
       ).toLocaleString()}</p>
    `;
      // Email content for the user
      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentData.email,
        subject: "Payment Confirmation",
        html: `
        <p>Dear ${paymentData.firstName} ${paymentData.lastName},</p>
        <p>Thank you for your purchase! Your payment of $${(
          paymentData.amount / 100
        ).toFixed(2)} was successful.</p>
        <h3>Order Details:</h3>
          ${paymentDataHtml}
           <h3>Ordered Items:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartItemsTable}
          </tbody>
        </table>
        <p>Best regards,<br>Sindhus kitchen</p>
      `,
      };

      // Email content for the created email
      const createdMailOptions = {
        from: paymentData.email,
        to: process.env.EMAIL_USER,
        subject: "New Order Received",
        html: `
        <h3>New order received:</h3>
        <p>Order Details:</p>
       ${paymentDataHtml}
        <h3>Ordered Items:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartItemsTable}
          </tbody>
        </table>
      `,
      };

      // Send email to the user
      transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to user:", error.message);
        } else {
          console.log("Email sent to user:", info.response);
        }
      });

      // Send email to the created email
      transporter.sendMail(createdMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to created email:", error.message);
        } else {
          console.log("Email sent to created email:", info.response);
        }
      });
    } catch (error) {
      console.error("Error retrieving cart item:", error.message);
    }
    res.status(201).json({ message: "Cart items saved successfully" });
  } catch (error) {
    console.error("Error saving cart items:", error);
    res
      .status(500)
      .json({ error: "Failed to save cart items", details: error.message });
  }
};
