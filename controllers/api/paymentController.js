/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const Payment = require("../../database/models/payment");
const OrderNumber = require("../../database/models/orderNumber");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

exports.OrderNumber = async (req, res) => {
  try {
    const lastItem = await OrderNumber.findOne().sort({ order: -1 }).exec();

    if (!lastItem) {
      return res.status(404).json({ message: "No items found" });
    }
    const newOrderNumber = parseInt(lastItem.orderNumber, 10) + 1;

    res.status(200).send(lastItem.toString());
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the last item", error });
  }
};

exports.getLastCreatedPayment = async (req, res) => {
  try {
    const lastItem = await OrderNumber.findOne();
    // .sort({ orderNumber: -1 })
    // .exec();

    console.log("lastItem", lastItem);

    // console.log("lastItem", lastItem.orderNumber);
    if (!lastItem) {
      return res.status(404).json({ message: "No items found" });
    }
    const newOrderNumber = parseInt(lastItem.orderNumber, 10) + 1;
    console.log("newOrderNumber", newOrderNumber);

    await OrderNumber.findOneAndUpdate(
      { orderNumber: lastItem.orderNumber }, // Find the latest document
      { $set: { orderNumber: newOrderNumber } }, // Update the orderNumber field
      { new: true } // Return the updated document
    );

    res.status(200).send(newOrderNumber.toString());
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
  } = req.body;

  console.log(req.body);

  try {
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
