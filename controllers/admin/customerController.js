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
const crypto = require("crypto");
const { State, City } = require("country-state-city");
const validator = require("validator");
const PhoneNumber = require("libphonenumber-js");

// AES encryption/decryption key
const AES_KEY = "SindhuV".padEnd(32, '\0')
const IV_LENGTH = 32; // For AES, this is always 16

/**
 * Encrypt data using AES encryption
 * @param {string} data - Data to be encrypted
 * @returns {string} - Encrypted data with IV appended
 */
const encryptData = (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(AES_KEY), iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Append IV to encrypted data
};

/**
 * Decrypt data using AES decryption
 * @param {string} encryptedData - Encrypted data with IV appended
 * @returns {string} - Decrypted data
 */
const decryptData = (encryptedData) => {
  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(AES_KEY), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.signup = async (req, res, next) => {
  const {name, email, phoneNumber, address, city, state, zipCode, password} = req.body;

  try {

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }


    try {
      const parsedPhoneNumber = PhoneNumber.parsePhoneNumberFromString(phoneNumber, "US");
      if (!parsedPhoneNumber || !parsedPhoneNumber.isValid() || !parsedPhoneNumber.isPossible()) {
        throw new Error("Invalid US phone number format");
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid US phone number format" });
    }


    const states = State.getStatesOfCountry("US");
    const isValidState = states.find(usState => usState.name=== state);
    if (!isValidState) {
      return res.status(400).json({ message: "Invalid state" });
    }


    const cities = City.getCitiesOfState("US", isValidState.isoCode);
    const isValidCity = cities.find(usCity => usCity.name === city);
    if (!isValidCity) {
      return res.status(400).json({ message: "Invalid city" });
    }
    

    const encryptedEmail = encryptData(email);
    const encryptedPhoneNumber = encryptData(phoneNumber);
    const encryptedPassword = encryptData(password);
    

    const newUser = new UserModel({
      name,
      email: encryptedEmail,
      phoneNumber: encryptedPhoneNumber,
      address,
      city,
      state,
      zipCode,
      password: encryptedPassword
    });

    const savedUser = await newUser.save();

    // Return success response
    res.status(201).json({
      message: "Signup Successful",
      data: {
        userId: savedUser._id,
        name: savedUser.name,
        email: decryptData(savedUser.email),
        phoneNumber: decryptData(savedUser.phoneNumber),
        address: savedUser.address,
        city: savedUser.city,
        state: savedUser.state,
        zipCode: savedUser.zipCode
      }
    });
  } catch (error) {
    next(error);
  }
};

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
      const users = await UserModel.find();

      let foundUser;
      for (const user of users) {
        const decryptedEmail = decryptData(user.email); // Decrypt the email
        if (decryptedEmail === email) {
          foundUser = user;
          break;
        }
      }

      if (!foundUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const decryptedPassword = decryptData(foundUser.password);
      const isPasswordValid = await bcrypt.compare(password, decryptedPassword);
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 400;
        throw error;
      }

      var userObj = {
        userId: foundUser._id,
        email: foundUser.email,
        name: foundUser.name,
      };

      const token = jwt.sign(userObj, SECRET_KEY);

      res.cookie(ACCESS_TOKEN, token, {
        httpOnly: true,
        maxAge: ExpirationInMilliSeconds, //2 days
      });

      res.status(200).json({
        message: "Login successful",
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
