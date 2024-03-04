/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const {
  SECRET_KEY,
  ACCESS_TOKEN,
  ExpirationInMilliSeconds,
} = require("../../constants/Constants");
const UserModel = require("../../database/models/user");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.adminLogin = async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Empty credentials supplied");
    error.statusCode = 454;
    throw error;
  } else {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        const error = new Error("User Not Available Please Signup to continue");
        error.statusCode = 401;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 400;
        throw error;
      }

      var userObj = {
        userId: user._id,
        email: user.email,
        name: user.name,
      };

      const token = jwt.sign(userObj, SECRET_KEY);

      res.cookie(ACCESS_TOKEN, token, {
        httpOnly: true,
        maxAge: ExpirationInMilliSeconds, //2 days
      });

      res.status(200).json({
        message: "Signin successful",
        data: userObj,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.signup = async (req, res, next) => {
  let { name, phoneNumber, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      const error = new Error(
        "Invalid User with provided email already exists entered!"
      );
      error.statusCode = 409;
      throw error;
    } else {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new UserModel({
        name,
        phoneNumber,
        email,
        password: hashedPassword
      });
      const savedUser = await newUser.save();
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: savedUser._id,
          phoneNumber: savedUser.phoneNumber,
          name: savedUser.name,
        },
        SECRET_KEY
      );

      res
        .cookie(ACCESS_TOKEN, token, {
          httpOnly: true,
          maxAge: ExpirationInMilliSeconds, //2days
        })
        .status(200)
        .json({
          message: "Signup Successful",
          data: {
            userId: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
          },
        });
    }
  } catch (error) {
    console.error(error);
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




/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */



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

    // Update the password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};










