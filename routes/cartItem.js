// routes/cartItem.js
const express = require("express");
const router = express.Router();
const cartItemController = require("../controllers/api/cartItemController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/cartItem", use(cartItemController.createCartItems));
router.get("/cartItems", use(cartItemController.getLastCreatedCartItem));
// router.delete("/cartItems", use(cartItemController.deleteAllCartItems));

module.exports = router;
