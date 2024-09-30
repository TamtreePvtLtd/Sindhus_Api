const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/api/paymentController"); // Adjust the path as needed

// Define routes
router.post("/createPaymentIntent", paymentController.createPaymentIntent);
router.post("/saveTransaction", paymentController.saveTransaction);
router.get("/lasttransaction", paymentController.getLastCreatedPayment);
router.get("/transaction", paymentController.getAllPayment);

module.exports = router;
