const Payment = require("../../database/models/payment");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
  } = req.body;

  try {
    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
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
      amount: amount, // Amount is in cents
      paymentId: paymentIntent.id,
      status: paymentIntent.status, // This might initially be 'requires_confirmation'
      deliveryDate: new Date(deliveryDate),
      createdAt: new Date(),
    });

    await transaction.save();

    // Respond with the client secret to confirm payment on the frontend
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created and saved successfully",
    });
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
