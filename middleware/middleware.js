const jwt = require("jsonwebtoken");
const UserModel = require("../database/models/user");
const { SECRET_KEY, ACCESS_TOKEN } = require("../constants/Constants");

const useAuth = async (req, res, next) => {
  const { sindhus_access_token } = req.cookies;

  try {
    if (!sindhus_access_token) {
      const error = new Error("token not found");
      error.statusCode = 401;
      throw error;
    }
    const payload = await validateAccessToken(sindhus_access_token);
    if (payload) {
      return next();
    }
  } catch (error) {
    if (error && error.name && error.name == "TokenExpiredError") {
      res.clearCookie(ACCESS_TOKEN);
      const error = new Error(error.message);
      error.statusCode = 401;
      next(error);
    } else {
      next(error);
    }
  }
};

async function validateAccessToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { userId } = decoded;
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 409;
      throw error;
    }
    return decoded;
  } catch (error) {
    throw error;
  }
}

module.exports = { useAuth };
