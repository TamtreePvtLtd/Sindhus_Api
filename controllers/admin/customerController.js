/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validator = require('validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const {
  SECRET_KEY,
  ACCESS_TOKEN,
  ExpirationInMilliSeconds,
} = require("../../constants/Constants");

const UserModel = require("../../database/models/user");

const securityKey = "SindhuV";
const iv = crypto.randomBytes(16); // 16 bytes for AES
const key = crypto.scryptSync(securityKey, 'salt', 32);

// Function to encrypt data using AES
function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Function to decrypt data using AES
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.signup = async (req, res, next) => {
  const { name, email, phoneNumber, password, address, city, state, zipcode } = req.body;

  try {
    // Validate email
    if (!validator.isEmail(email)) {
      const error = new Error("Invalid email address");
      error.statusCode = 422;
      throw error;
    }

    // Validate phone number
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'US');
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      const error = new Error("Invalid phone number");
      error.statusCode = 422;
      throw error;
    }

    // Check if the email already exists
    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    // Check if the phone number already exists
    const existingUserByPhoneNumber = await UserModel.findOne({ phoneNumber });
    if (existingUserByPhoneNumber) {
      const error = new Error("Phone number already exists");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Encrypt sensitive data before saving
    const encryptedEmail = encrypt(email);
    const encryptedPhoneNumber = encrypt(phoneNumber);

    // Create new user with encrypted sensitive data
    const newUser = new UserModel({
      name,
      email: encryptedEmail,
      phoneNumber: encryptedPhoneNumber,
      password: hashedPassword,
      address,
      city,
      state,
      zipcode,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    res.status(200).json({
      message: "Signup Successful",
      data: {
        userId: savedUser._id,
        name: savedUser.name,
        email, // For response, return original email
        phoneNumber, // For response, return original phoneNumber
        address: savedUser.address,
        city: savedUser.city,
        state: savedUser.state,
        zipcode: savedUser.zipcode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;



  try {

  const decryptedEmailForSearch = decrypt(email); 

    // Find the user by their email
    const user = await UserModel.findOne({ email:decryptedEmailForSearch});

    // If user not found, return error
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Decrypt sensitive data to compare with provided password
    const decryptedEmail = decrypt(user.email);
    const decryptedPhoneNumber = decrypt(user.phoneNumber);

    // Compare provided email with decrypted email
    if (decryptedEmail !== email) {
      const error = new Error("Incorrect email");
      error.statusCode = 401;
      throw error;
    }

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }

    // If email and password are correct, generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: decryptedEmail },
      SECRET_KEY,
      { expiresIn: ExpirationInMilliSeconds }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      data: {
        userId: user._id,
        name: user.name,
        email: decryptedEmail,
        phoneNumber: decryptedPhoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.isAuthorized = async (req, res) => {
  const { sindhus_access_token } = req.cookies;

  if (sindhus_access_token) {
    // Check if the access token is valid
    const payload = await validateAccessToken(sindhus_access_token);
    if (payload) {
      res.json(payload);
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
};

async function validateAccessToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { userId } = decoded;

    // Check if the userId exists in the UserModel database
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.logout = async (req, res) => {
  res.clearCookie(ACCESS_TOKEN);
  res.status(200).json({
    status: true,
    message: "Logged out successfully",
    data: null,
  });
};

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'logeswaran2108@gmail.com',
    pass: 'gnwd bggl urll soxt',
  },
});

const otps = {};

// Function to generate a random OTP
function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: 6,
    step: 300 // OTP changes every 5 minutes
  });
}

// Controller to send OTP to email
exports.requestOtp = (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otps[email] = otp;

  // Send email with OTP
  transporter.sendMail({
    from: 'logeswaran2108@gmail.com',
    to: email,
    subject: 'OTP for Password Reset',
    text: `Your OTP for password reset is: ${otp}
          OTP only valid for 5 mins`
  }, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending OTP email' });
    }
    console.log('Email sent:', info.response);
    res.json({ message: 'OTP sent to email successfully' });
  });
};

exports.verifyOtp = async (req, res) => {
  const { otp, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email not found in request' });
  }

  const storedOtp = otps[email];

  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP not found for the provided email' });
  }

  if (storedOtp === otp) {
    // If OTP is valid, you can delete it from memory
    delete otps[email];
    return res.json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
};

exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    // Update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
