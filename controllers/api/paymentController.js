/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const Payment = require("../../database/models/payment");
const OrderNumber = require("../../database/models/orderNumber");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createShipmentTransaction } = require("../api/shipmentController");
const nodemailer = require("nodemailer");
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
// let orderCounter = 1000; // Initialize the counter

// const generateOrderNumber = () => {
//   const orderNumber = orderCounter++; // Increment the counter for each new order
//   return `#${orderNumber}`;
// };
exports.getAllPayment = async (req, res) => {
  try {
    const paymentItems = await Payment.find().sort({ orderNumber: -1 }).exec();
    res.status(200).json(paymentItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};

exports.getLastCreatedPayment = async (req, res) => {
  try {
    const lastItem = await OrderNumber.findOne()
      .sort({ orderNumber: -1 })
      .exec();
    // console.log("lastItem", lastItem.orderNumber);
    if (!lastItem) {
      return res.status(404).json({ message: "No items found" });
    }

    const orderNumber = lastItem.orderNumber;
    const newOrderNumber = parseInt(orderNumber, 10) + 1;
    console.log("newOrderNumber", newOrderNumber);

    // Update the orderNumber field
    await OrderNumber.findOneAndUpdate(
      { orderNumber: lastItem.orderNumber },
      { $set: { orderNumber: newOrderNumber.toString() } },
      { new: true }
    );

    // Send the updated order number back to the frontend
    res.status(200).send(orderNumber.toString());
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the last item", error });
  }
};

exports.createPaymentIntent = async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    phoneNumber,
    email,
    deliveryOption,
    amount,
    deliveryDate,
    postalCode,
    orderNumber,
    couponName,
    totalWithoutCoupon,
    totalWithCoupon,
    addressURL,
    notes,
    rateObjId,
    carrierAccount,
    shippingAmount,
  } = req.body;

  try {
    // 1. Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    const transaction = new Payment({
      firstName,
      lastName,
      address,
      phoneNumber,
      email,
      deliveryOption,
      amount,
      paymentId: paymentIntent.id,
      postalCode,
      status: paymentIntent.status,
      deliveryDate: new Date(deliveryDate),
      createdAt: new Date(),
      orderNumber,
      couponName,
      totalWithCoupon,
      totalWithoutCoupon,
      addressURL,
      notes,
      rateObjId,
      carrierAccount,
      shippingAmount
    });

    await transaction.save();

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created and saved successfully",
      orderNumber,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).send({ error: error.message });
  }
};

exports.updateShipmentDetails = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { trackingNumber, trackingUrl } = req.body;

    if (!trackingNumber || !trackingUrl) {
      return res.status(400).json({ error: "Tracking details required" });
    }

    const order = await Payment.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;

    await order.save();

    const recipientName = order.firstName || "Customer";
    const senderEmail = order.email || "noreply@sindhuskitchen.com";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: senderEmail,
      subject: `Shipment Details for Order ${orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: rgba(44, 62, 80, 1);">
            Hi ${recipientName},
          </h2>
          <p>Great news! Your order has been shipped and is on its way 🎉</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p>You can track your shipment in real time by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${trackingUrl}"
               style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; display: inline-block;">
              Track My Order
            </a>
          </p>
          <p>If the button doesn’t work, you can also copy and paste this link into your browser:</p>
          <p><a href="${trackingUrl}">${trackingUrl}</a></p>
          <hr style="margin: 20px 0;" />
          <p>Thank you for shopping with us!<br />— The sindhuskitchen Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Shipment details updated & email sent", order });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteDeliveredPayment = async (req, res) => {
  try {
    const orderId = req.params.orderNumber; // Extract order ID from the URL
    console.log("delete orderId", orderId);

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Find the order by ID and delete it
    const order = await Payment.findOneAndDelete({ orderNumber: orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePaymentIntent = async (req, res) => {
  try {
    console.log("req.params", req.params);
    console.log("req.body", req.body);

    const orderId = req.params.orderNumber; // Extract order ID from the URL
    const { email, phoneNumber } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (email === undefined || phoneNumber === undefined) {
      return res
        .status(400)
        .json({ error: "orderId and phoneNumber is required" });
    }

    // Find the order by ID and update the delivered status
    const order = await Payment.findOneAndUpdate(
      { orderNumber: orderId }, // Match the orderNumber
      { email, phoneNumber }, // Update the delivered status
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Save Transaction
exports.saveTransaction = async (req, res) => {
  const { amount, paymentId, status } = req.body;

  try {
    const transaction = new Payment({
      amount,
      paymentId,
      status,
      createdAt: new Date(),
    });

    await transaction.save();
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
