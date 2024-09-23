const express = require("express");
const router = express.Router();
const CartItem = require("../../database/models/cartItem");

// POST endpoint to save cart items
exports.createCartItems = async (req, res) => {
  try {
    const cartItems = req.body.cartItems;
    console.log(cartItems);

    await CartItem.insertMany(cartItems);
    res.status(201).json({ message: "Cart items saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save cart items" });
  }
};

exports.getLastCreatedCartItem = async (req, res) => {
  console.log("start");

  try {
    console.log("start");
    const lastCreatedCartItem = await CartItem.find().sort({
      createdAt: -1,
    });

    if (!lastCreatedCartItem) {
      return res.status(404).json({ error: "No cart items found" });
    }
    // res.status(200).json({ lastCreatedCartItem });
    return lastCreatedCartItem;
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve the last created cart item" });
  }
};
