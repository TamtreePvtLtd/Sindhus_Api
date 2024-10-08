const express = require("express");
require("dotenv").config();
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
var cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const connectionString = process.env.CONNECTION_STRING || "";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "Password",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      httpOnly: true,
    },
  })
);

//Routes imports goes here
var menuRouter = require("./routes/menu");
var productRouter = require("./routes/product");
var diningOutRouter = require("./routes/diningOut");
var enquiryRouter = require("./routes/enquiry");
var customerRouter = require("./routes/customer");
var cateringUserRouter = require("./routes/cateringUser");
var specialsRouter = require("./routes/specials");
var paymentRouter = require("./routes/payment");
var cartItem = require("./routes/cartItem");
var coupenRouter = require("./routes/coupen");
var distanceRouter = require("./routes/distance");

app.use((req, res, next) => {
  const allowedOriginsWithCredentials = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://admin.sindhuskitchen.com",
    "https://sindhuskitchen.com",
  ];

  const isAllowedWithCredentials = allowedOriginsWithCredentials.some(
    (origin) => req.headers.origin === origin
  );

  if (isAllowedWithCredentials) {
    cors({
      origin: req.headers.origin,
      credentials: true,
    })(req, res, next);
  } else {
    cors()(req, res, next);
  }
});

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
app.use("/menu", menuRouter);
app.use("/product", productRouter);
app.use("/diningOut", diningOutRouter);
app.use("/enquiry", enquiryRouter);
app.use("/customer", customerRouter);
app.use("/cateringUser", cateringUserRouter);
app.use("/specials", specialsRouter);
app.use("/payment", paymentRouter);
app.use("/cart", cartItem);
app.use("/coupen", coupenRouter);
app.use("/distance", distanceRouter);

//these middleware should at last but before error handlers
app.use("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the server`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

//Error handling middleware
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  console.log(error);
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
