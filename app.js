const express = require("express");
require("dotenv").config();
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
var cors = require("cors");
const session = require("express-session");
const path = require("path");
const cron = require("node-cron");
const XLSX = require('xlsx');
const fs = require("fs");

const app = express();
 

const OrderItem = mongoose.model('OrderItem', new mongoose.Schema({
  cartItems: Array,
  orderNumber: String,
  deliveredStatus: String,
}));

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const handleExcelDownload = async () => {
  // Get the current date and time
  const now = new Date();

  // Set 'today at 00:00 AM'
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0); // Today 00:00 AM

  // Set 'yesterday at 00:00 AM'
  const yesterdayAtMidnight = new Date(todayAtMidnight);
  yesterdayAtMidnight.setDate(yesterdayAtMidnight.getDate() - 1); // Yesterday 00:00 AM

  // Set 'yesterday at 11:59 PM'
  const yesterdayAtEndOfDay = new Date(todayAtMidnight);
  yesterdayAtEndOfDay.setDate(yesterdayAtEndOfDay.getDate() - 1);
  yesterdayAtEndOfDay.setHours(23, 59, 59, 999); // Yesterday 11:59 PM

  // Fetch orders created between yesterday 00:00 AM and 11:59 PM
  const orders = await OrderItem.find({
    "cartItems.createdAt": {
      $gte: yesterdayAtMidnight, // Greater than or equal to yesterday at 00:00 AM
      $lt: todayAtMidnight, // Less than today at 00:00 AM (this ensures we only get yesterday's data)
    },
  });

  const dataToDownload = orders
    .map((order) => {
      const { cartItems, orderNumber, deliveredStatus } = order;
      return cartItems.map((item) => ({
        Name: item.name,
        "Order Number": orderNumber,
        Address: item.address,
        "Phone Number": item.phoneNumber,
        "Delivery Option": item.deliveryOption,
        Email: item.email,
        "Ordered Date": formatDate(item.createdAt),
        "Delivery Date": formatDate(item.deliveryDate),
        "Item Title": item.title,
        Quantity: item.quantity,
        Size: item.size,
        "Location URL": item.addressURL,
        "Coupon Name": item.couponName,
        "Total Amount without Coupon": item.totalWithoutCoupon,
        "Total Amount with Coupon": item.totalWithCoupon,
        "Delivered Status":
          deliveredStatus === "true" ? "Delivered" : "Pending",
      }));
    })
    .flat();

  const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  const dateStr = now.toLocaleDateString().replace(/\//g, "-");
  const timeStr = now.toLocaleTimeString().replace(/:/g, "-");

  XLSX.writeFile(workbook, `filtered_orders_${dateStr}_${timeStr}.xlsx`);
};


// Ensure the directory exists
const downloadsDir = path.join(__dirname, 'downloaded_orders');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Schedule the task to run at 10 AM every day
cron.schedule('0 10 * * *', async () => {
  console.log('Running the Excel download task at 10 AM every day');
  await handleExcelDownload();
});


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

app.get("/download-orders", async (req, res) => {
  try {
    await handleExcelDownload();
    res.status(200).send("Order data downloaded successfully.");
  } catch (error) {
    console.error("Error downloading order data:", error);
    res.status(500).send("Failed to download order data.");
  }
});


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
