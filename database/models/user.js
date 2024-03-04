const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: String,
  password: {
    type: String,
    required: true,
  }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
