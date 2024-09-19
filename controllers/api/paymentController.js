

const Payment = require("../../database/models/payment"); // Ensure the path is correct
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Use environment variable for the secret key

// Create Payment Intent and Save to Database
exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;

  try {
    // Create the payment intent using Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    // Save the payment details to the database
    const transaction = new Payment({
      amount: amount, // Amount is in cents
      paymentId: paymentIntent.id,
      status: paymentIntent.status,
      createdAt: new Date(),
    });

    // Save transaction to the database
    await transaction.save();

    // Respond with the client secret and success message
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created and saved successfully",
    });
  } catch (error) {
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
