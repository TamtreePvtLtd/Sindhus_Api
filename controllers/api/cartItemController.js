const OrderItem = require("../../database/models/cartItem");
const nodemailer = require("nodemailer");
const path = require("path");
const logoPath = path.join(__dirname, "../../uploads/logo.png"); // Update with your correct path to logo

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

exports.createCartItems = async (req, res) => {
  try {
    const { cartItems, paymentData, orderNumber } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }
    const deliveredStatus = "false";
    const newOrder = {
      cartItems,
      orderNumber,
      deliveredStatus,
    };

    const order = new OrderItem(newOrder);

    // Save the order to the database
    await order.save();

    const totalQuantity = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Save the order to the database
    // await cartItems.save();
    res.status(201).json(order);

    const formattedDeliveryDate = formatDate(paymentData.deliveryDate);
    const formattedCreatedAt = formatDate(paymentData.createdAt);

    const cartItemsTable = cartItems
      .map(
        (item) => `
      <tr>
      <img src="${item.imageUrl}" alt="${
          item.title
        }" style="width: 100px; height: 100px; object-fit: cover;" />
        <td>${item.title}</td>
         <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.quantity * item.price).toFixed(2)}</td>
       
      </tr>
    `
      )
      .join("");

    const paymentDataHtml = `
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>First Name:</strong> ${paymentData.firstName}</p>
      <p><strong>Last Name:</strong> ${paymentData.lastName}</p>
      <p><strong>Delivery Date:</strong> ${formattedDeliveryDate}</p>
      <p><strong>Delivery Option:</strong> ${paymentData.deliveryOption}</p>
      <p><strong>Phone Number:</strong> ${paymentData.phoneNumber}</p>
      <p><strong>Address:</strong> ${paymentData.address}</p>
      <p><strong>Email:</strong> ${paymentData.email}</p>
      <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
      <p><strong>Amount:</strong> $${(paymentData.amount / 100).toFixed(2)}</p>
       <p><strong>Order Date:</strong> ${formattedCreatedAt}</p>
       <p><strong>Order Location URL:</strong> ${paymentData.addressURL}</p>
       <p><strong>Order Notes:</strong> ${paymentData.notes}</p>
    `;
    // Email content for the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: paymentData.email,
      subject: "Payment Confirmation",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      
      <!-- Logo and Sindhu's Heading -->
      <div style="text-align: center; padding-bottom: 10px;">
      <h1 style="font-size: 28px; color: #038265; margin: 10px 0;">SINDHU'S</h1>
        <img src="cid:logo" alt="Sindhus Kitchen" style="width: 80px; height: 80px; object-fit: contain;" />
        
      </div>

      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <h3>Order # : <strong>${paymentData.orderNumber}</strong></h3>
        <p>Thank you for your purchase, <strong>${paymentData.firstName} ${
        paymentData.lastName
      }</strong> &nbsp;!</p>
        <p>Your payment of $${(paymentData.amount / 100).toFixed(
          2
        )} was successful.</p>
      </div>

      <!-- Order Summary Card -->
      <div style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555;">Order Summary</h3>

        <!-- Loop through each cart item and display its details -->
        ${cartItems
          .map(
            (item) => `
            <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
              <img src="${item.imageUrl}" alt="${
              item.title
            }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-right: 15px;" />
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 16px;"><strong>${
                  item.title
                }</strong></p>
                <p style="margin: 5px 0; color: #777;">Size: ${item.size}</p>
                <p style="margin: 5px 0; color: #777;">Quantity: ${
                  item.quantity
                }</p>
                 <p style="margin: 5px 0; font-size: 14px; color: #777;">Price: $${parseFloat(
                   item.price
                 ).toFixed(2)}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #777;">Total: $${parseFloat(
                  item.quantity * item.price
                ).toFixed(2)}</p>
              </div>
            </div>
          `
          )
          .join("")}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px;">
          <p>Total Quantity: <strong>${totalQuantity}</strong></p>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px;">
          <p>Total: <strong>$${(paymentData.amount / 100).toFixed(
            2
          )}</strong></p>
        </div>
      </div>

      <!-- Customer Information Card -->
      <div style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555;">Customer Information</h3>
        <div style="display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <h4 style="margin-bottom: 10px;">Customer Details:</h4>
            <p style="margin: 0; font-size: 14px; color: #777;">${
              paymentData.firstName
            } ${paymentData.lastName}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #777;">${
              paymentData.address
            }</p>
          </div>
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px;">Delivery Date</h4>
            <p style="margin: 5px 0; font-size: 14px; color: #777;">${formattedDeliveryDate}</p>
            <h4 style="margin-bottom: 10px;">Shipping Method</h4>
            <p style="margin: 0; font-size: 14px; color: #777;">${
              paymentData.deliveryOption
            }</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 10px;">
        <h3 style="border-bottom: 1px solid #eee; color: #555;">Contact Us:</h3>
        <p style="font-size: 14px; color: #777; margin-top: 10px;">
           2700 E Eldorado Pkwy, #203, Little Elm, Texas - 75068<br>
           <a href="tel:+19402792536" style="color: #038265;">+1 940-279-2536</a><br>
           <a href="mailto:sindhuskitchenusa@gmail.com" style="color: #038265;">sindhuskitchenusa@gmail.com</a><br>
           <a href="http://sindhuskitchen.com" style="color: #038265;">sindhuskitchen.com</a><br>
        </p>
        <p style="font-size: 14px; color: #038265;"><b>Best Regards,<br>SINDHU'S</b></p>
      </div>
    </div>
  `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo", // same cid as in the html img src
        },
      ],
    };


    // Email content for the created email
    const createdMailOptions = {
      from: paymentData.email,
      to: process.env.EMAIL_USER,
      subject: "New Order Received",
      html: `
        <h3>New order received:</h3>
        <p>Order Details:</p>
       ${paymentDataHtml}
        <h3>Ordered Items:</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <thead>
            <tr>
             <th>Image</th>
             <th>Item Name</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartItemsTable}
              <tr>
              <td colspan="5" style="text-align: right; font-weight: bold;">Total Amount with Tax:</td>
        <td style="font-weight: bold;">$${(paymentData.amount / 100).toFixed(
          2
        )}</td>
          </tbody>
        </table>
      `,
    };

    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to user:", error.message);
      } else {
        console.log("Email sent to user:", info.response);
      }
    });

    transporter.sendMail(createdMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to admin:", error.message);
      } else {
        console.log("Email sent to admin:", info.response);
      }
    });

    res.status(201).json({ message: "Cart items created and emails sent" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const orderId = req.params.orderNumber; // Extract order ID from the URL
    const deliveredStatus = req.body;
    console.log("req.body", req.body);

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (deliveredStatus === undefined) {
      return res.status(400).json({ error: "Delivered status is required" });
    }

    // Find the order by ID and update the delivered status
    const order = await OrderItem.findOneAndUpdate(
      { orderNumber: orderId }, // Match the orderNumber
      deliveredStatus, // Update the delivered status
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllCartItem = async (req, res) => {
  try {
    const cartItems = await OrderItem.find().sort({ orderNumber: -1 }).exec();
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderNumber; // Extract order ID from the URL

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Find the order by ID and delete it
    const order = await OrderItem.findOneAndDelete({ orderNumber: orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.resendMail = async (req, res) => {
  const { cartItems, paymentData } = req.query;

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const formattedDeliveryDate = formatDate(paymentData.deliveryDate);
  const formattedCreatedAt = formatDate(paymentData.createdAt);

  const cartItemsTable = cartItems
    .map(
      (item) => `
      <tr>
      <img src="${item.imageUrl}" alt="${
        item.title
      }" style="width: 100px; height: 100px; object-fit: cover;" />
        <td>${item.title}</td>
         <td>${item.size}</td>
        <td>${item.quantity}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>$${parseFloat(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const paymentDataHtml = `
      <p><strong>Order Number:</strong> ${paymentData.orderNumber}</p>
      <p><strong>First Name:</strong> ${paymentData.firstName}</p>
      <p><strong>Last Name:</strong> ${paymentData.lastName}</p>
      <p><strong>Delivery Date:</strong> ${formattedDeliveryDate}</p>
      <p><strong>Delivery Option:</strong> ${paymentData.deliveryOption}</p>
      <p><strong>Phone Number:</strong> ${paymentData.phoneNumber}</p>
      <p><strong>Address:</strong> ${paymentData.address}</p>
      <p><strong>Email:</strong> ${paymentData.email}</p>
      <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
      <p><strong>Amount:</strong> $${(paymentData.amount / 100).toFixed(2)}</p>
       <p><strong>Order Date:</strong> ${formattedCreatedAt}</p>
    `;
  // Email content for the user
 const userMailOptions = {
   from: process.env.EMAIL_USER,
   to: paymentData.email,
   subject: "Payment Confirmation",
   html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      
      <!-- Logo and Sindhu's Heading -->
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="cid:logo" alt="Sindhus Kitchen" style="width: 80px; height: 80px; object-fit: contain;" />
        <h1 style="font-size: 28px; color: #038265; margin: 10px 0;">Sindhu's</h1>
      </div>

      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <h3>Order # : <strong>${paymentData.orderNumber}</strong></h3>
        <p>Thank you for your purchase, <strong>${paymentData.firstName} ${
     paymentData.lastName
   }</strong> &nbsp;!</p>
        <p>Your payment of $${(paymentData.amount / 100).toFixed(
          2
        )} was successful.</p>
      </div>

      <!-- Order Summary Card -->
      <div style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555;">Order Summary</h3>

        <!-- Loop through each cart item and display its details -->
        ${cartItems
          .map(
            (item) => `
            <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
              <img src="${item.imageUrl}" alt="${
              item.title
            }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-right: 15px;" />
              <div style="flex: 1;">
                <p style="margin: 0; font-size: 16px;"><strong>${
                  item.title
                }</strong></p>
                <p style="margin: 5px 0; color: #777;">Size: ${item.size}</p>
                <p style="margin: 5px 0; color: #777;">Quantity: ${
                  item.quantity
                }</p>
                 <p style="margin: 5px 0; font-size: 14px; color: #777;">Price: $${parseFloat(
                   item.price
                 ).toFixed(2)}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #777;">Total: $${parseFloat(
                  item.quantity * item.price
                ).toFixed(2)}</p>
              </div>
            </div>
          `
          )
          .join("")}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px;">
          <p>Total Quantity: <strong>${totalQuantity}</strong></p>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px;">
          <p>Total: <strong>$${(paymentData.amount / 100).toFixed(
            2
          )}</strong></p>
        </div>
      </div>

      <!-- Customer Information Card -->
      <div style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555;">Customer Information</h3>
        <div style="display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <h4 style="margin-bottom: 10px;">Customer Details:</h4>
            <p style="margin: 0; font-size: 14px; color: #777;">${
              paymentData.firstName
            } ${paymentData.lastName}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #777;">${
              paymentData.address
            }</p>
          </div>
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px;">Delivery Date</h4>
            <p style="margin: 5px 0; font-size: 14px; color: #777;">${formattedDeliveryDate}</p>
            <h4 style="margin-bottom: 10px;">Shipping Method</h4>
            <p style="margin: 0; font-size: 14px; color: #777;">${
              paymentData.deliveryOption
            }</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 10px;">
        <h3 style="border-bottom: 1px solid #eee; color: #555;">Contact Us:</h3>
        <p style="font-size: 14px; color: #777; margin-top: 10px;">
           2700 E Eldorado Pkwy, #203, Little Elm, Texas - 75068<br>
           <a href="tel:+19402792536" style="color: #038265;">+1 940-279-2536</a><br>
           <a href="mailto:sindhuskitchen1@gmail.com" style="color: #038265;">sindhuskitchen1@gmail.com</a><br>
           <a href="http://sindhuskitchen.com" style="color: #038265;">sindhuskitchen.com</a><br>
        </p>
        <p style="font-size: 14px; color: #038265;"><b>Best Regards,<br>SINDHU'S</b></p>
      </div>
    </div>
  `,
   attachments: [
     {
       filename: "logo.png",
       path: logoPath,
       cid: "logo", // same cid as in the html img src
     },
   ],
 };


  // Email content for the created email
  // const createdMailOptions = {
  //   from: paymentData.email,
  //   to: process.env.EMAIL_USER,
  //   subject: "New Order Received",
  //   html: `
  //       <h3>New order received:</h3>
  //       <p>Order Details:</p>
  //      ${paymentDataHtml}
  //       <h3>Ordered Items:</h3>
  //       <table border="1" cellpadding="5" cellspacing="0">
  //         <thead>
  //           <tr>
  //            <th>Image</th>
  //            <th>Item Name</th>
  //             <th>Size</th>
  //             <th>Quantity</th>
  //             <th>Unit Price</th>
  //             <th>Total Price</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${cartItemsTable}
  //         </tbody>
  //       </table>
  //     `,
  // };

  transporter.sendMail(userMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email to user:", error.message);
    } else {
      console.log("Email sent to user:", info.response);
    }
  });

  // transporter.sendMail(createdMailOptions, (error, info) => {
  //   if (error) {
  //     console.error("Error sending email to admin:", error.message);
  //   } else {
  //     console.log("Email resent to admin:", info.response);
  //   }
  // });

  res.status(200).json({ message: "Mail resent successfully" });
};
