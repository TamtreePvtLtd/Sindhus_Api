/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const Payment = require("../../database/models/payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const cartItemController = require("../api/cartItemController");
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

const transporter = nodemailer.createTransport({
  service: "Gmail", // Or any other email service you are using
  auth: {
    user: "deepa.tamtree@gmail.com",
    pass: "llbf upiq gaxj hqxy", // Make sure this is correct
  },
});

const handleCartItem = async (req, res) => {
  try {
    const cartResponse = await cartItemController.getLastCreatedCartItem(
      req,
      res
    );
    // Ensure no further response is sent after this point
  } catch (error) {
    res.status(500).json({ error: "Error handling cart item" });
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
  } = req.body;

  try {
    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount should be in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    // Save the payment details in your database
    const transaction = new Payment({
      firstName,
      lastName,
      address,
      phoneNumber,
      email,
      deliveryOption,
      amount, // Amount is in cents
      paymentId: paymentIntent.id,
      postalCode,
      status: paymentIntent.status, // This might initially be 'requires_confirmation'
      deliveryDate: new Date(deliveryDate),
      createdAt: new Date(),
    });
    console.log("transaction Details", transaction);

    await transaction.save();

    // Extract order details
    const { paymentId, status, ...orderDetails } = transaction.toObject();

    // Respond with the client secret to confirm payment on the frontend
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created and saved successfully",
    });
    console.log("status", paymentIntent.status);

    // Send email after payment success
    if (paymentIntent.status === "requires_payment_method") {
      try {
        console.log("start to get cart item");
        try {
          var cartResponse = await cartItemController.getLastCreatedCartItem();
          console.log("cartResponse", cartResponse);
          var cartItem = cartResponse;
        } catch (error) {
          console.log("cartResponseerror", cartResponse);
        }

        console.log("end to get cart item");

        console.log("cartItem", cartItem);

        // Email content for the user
        const userMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Payment Confirmation",
          text: `Dear ${firstName} ${lastName},\n\nThank you for your purchase! Your payment of $${(
            amount / 100
          ).toFixed(2)} was successful.\n\nBest regards,\nSindhus kitchen`,
        };

        // Email content for the created email
        const createdMailOptions = {
          from: email,
          to: process.env.EMAIL_USER,
          subject: "New Order Received",
          text: `New order received:\n\nOrder Details:\n${JSON.stringify(
            orderDetails,
            null,
            2
          )}`,
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
            console.error(
              "Error sending email to created email:",
              error.message
            );
          } else {
            console.log("Email sent to created email:", info.response);
          }
        });
      } catch (error) {
        console.error("Error retrieving cart item:", error.message);
      }
    }
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).send({ error: error.message });
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
