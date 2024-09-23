/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const Payment = require("../../database/models/payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

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
  } = req.body;

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
    });

    await transaction.save();

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created and saved successfully",
    });
    if (paymentIntent.status === "requires_payment_method") {
    }
  } catch (error) {
    if (!res.headersSent) {
      console.error("Error creating payment intent:", error.message);
      res.status(500).send({ error: error.message });
    }
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
