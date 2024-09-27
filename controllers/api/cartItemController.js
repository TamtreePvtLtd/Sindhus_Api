// const CartItem = require("../../database/models/cartItem");
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: "deepa.tamtree@gmail.com",
//     pass: "llbf upiq gaxj hqxy",
//   },
// });

// exports.createCartItems = async (req, res) => {
//   try {
//     const { cartItems, paymentData } = req.body;

//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ error: "Cart items are required" });
//     }
// const totalQuantity = cartItems.reduce(
//   (total, item) => total + item.quantity,
//   0
// );
//     await CartItem.insertMany(cartItems);
//     try {
//       const cartItemsTable = cartItems
//         .map(
//           (item) => `
//       <tr>
//       <img src="${item.imageURL}" alt="${
//             item.title
//           }" style="width: 100px; height: 100px; object-fit: cover;" />
//         <td>${item.title}</td>
//          <td>${item.size}</td>
//         <td>${item.quantity}</td>

//         <td>${item.price.toFixed(2)}</td>
//         <td>${(item.quantity * item.price).toFixed(2)}</td>
//       </tr>
//     `
//         )
//         .join("");

//       const paymentDataHtml = `
//        <p><strong>First Name:</strong> ${paymentData.firstName}</p>
//       <p><strong>Last Name:</strong> ${paymentData.lastName}</p>
//       <p><strong>Delivery Date:</strong> ${new Date(
//         paymentData.deliveryDate
//       ).toLocaleDateString()}</p>
//       <p><strong>  Delivery Option:</strong> ${paymentData.deliveryOption}</p>
//      <p><strong>Phone Number:</strong> ${paymentData.phoneNumber}</p>
//      <p><strong>Address:</strong> ${paymentData.address}</p>
//       <p><strong>Email:</strong> ${paymentData.email}</p>
//       <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
//       <p><strong>Amount:</strong> $${(paymentData.amount / 100).toFixed(2)}</p>
//        <p><strong>Order Date:</strong> ${new Date(
//          paymentData.createdAt
//        ).toLocaleString()}</p>
//     `;
//       // Email content for the user
//       const userMailOptions = {
//         from: process.env.EMAIL_USER,
//         to: paymentData.email,
//         subject: "Payment Confirmation",
//         html: `
//         <p>Dear ${paymentData.firstName} ${paymentData.lastName},</p>
//         <p>Thank you for your purchase! Your payment of $${(
//           paymentData.amount / 100
//         ).toFixed(2)} was successful.</p>
//         <h3>Order Details:</h3>
//           ${paymentDataHtml}
//            <h3>Ordered Items:</h3>
//         <table border="1" cellpadding="5" cellspacing="0">
//           <thead>
//             <tr>
//             <th>Image</th>
//                <th>Item Name</th>
//               <th>Size</th>
//               <th>Quantity</th>
//               <th>Unit Price</th>
//               <th>Total Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${cartItemsTable}
//           </tbody>
//         </table>
//         <p>Best regards,<br>Sindhus kitchen</p>
//       `,
//       };

//       // Email content for the created email
//       const createdMailOptions = {
//         from: paymentData.email,
//         to: process.env.EMAIL_USER,
//         subject: "New Order Received",
//         html: `
//         <h3>New order received:</h3>
//         <p>Order Details:</p>
//        ${paymentDataHtml}
//         <h3>Ordered Items:</h3>
//         <table border="1" cellpadding="5" cellspacing="0">
//           <thead>
//             <tr>
//              <th>Image</th>
//              <th>Item Name</th>
//               <th>Size</th>
//               <th>Quantity</th>
//               <th>Unit Price</th>
//               <th>Total Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${cartItemsTable}
//           </tbody>
//         </table>
//       `,
//       };

//       // Send email to the user
//       transporter.sendMail(userMailOptions, (error, info) => {
//         if (error) {
//           console.error("Error sending email to user:", error.message);
//         } else {
//           console.log("Email sent to user:", info.response);
//         }
//       });

//       // Send email to the created email
//       transporter.sendMail(createdMailOptions, (error, info) => {
//         if (error) {
//           console.error("Error sending email to created email:", error.message);
//         } else {
//           console.log("Email sent to created email:", info.response);
//         }
//       });
//     } catch (error) {
//       console.error("Error retrieving cart item:", error.message);
//     }
//     res.status(201).json({ message: "Cart items saved successfully" });
//   } catch (error) {
//     console.error("Error saving cart items:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to save cart items", details: error.message });
//   }
// };
const CartItem = require("../../database/models/cartItem");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "deepa.tamtree@gmail.com",
    pass: "llbf upiq gaxj hqxy",
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
    //  const orderNumber = req.orderNumber;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    const totalQuantity = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await CartItem.insertMany(cartItems);

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
        <td>${item.price.toFixed(2)}</td>
        <td>${(item.quantity * item.price).toFixed(2)}</td>
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
    `;

    // Email content for the user
    // const userMailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: paymentData.email,
    //   subject: "Payment Confirmation",
    //   html: `
    //     <p>Dear ${paymentData.firstName} ${paymentData.lastName},</p>
    //     <p>Thank you for your purchase! Your payment of $${(
    //       paymentData.amount / 100
    //     ).toFixed(2)} was successful.</p>
    //     <h3>Order Details:</h3>
    //       ${paymentDataHtml}
    //        <h3>Ordered Items:</h3>
    //     <table border="1" cellpadding="5" cellspacing="0">
    //       <thead>
    //         <tr>
    //         <th>Image</th>
    //            <th>Item Name</th>
    //           <th>Size</th>
    //           <th>Quantity</th>
    //           <th>Unit Price</th>
    //           <th>Total Price</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         ${cartItemsTable}
    //       </tbody>
    //     </table>
    //     <p>Best regards,<br>Sindhus kitchen</p>
    //   `,
    // };
    // Email content for the user
    // Email content for the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: paymentData.email,
      subject: "Payment Confirmation",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <h6 > Order : <strong>${orderNumber}</strong></h6>
        <p>Thank you for your purchase, <strong>${paymentData.firstName} ${
        paymentData.lastName
      }</strong>!</p>
        <p>Your payment of ₹${(paymentData.amount / 100).toFixed(
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
                 <p style="margin: 5px 0; font-size: 14px; color: #777;">Price: ₹${item.price.toFixed(
                   2
                 )}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #777;">Total: ₹${(
                  item.quantity * item.price
                ).toFixed(2)}</p>
              </div>
             
            </div>
          `
          )
          .join("")}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
        <div style="display: flex; justify-content: space-between;flex font-size: 16px; font-weight: bold; margin-top: 10px;">
        <p>Total Quantity: <strong>${totalQuantity}</strong></p>
          <p>Total:</p>
          <p>₹${(paymentData.amount / 100).toFixed(2)}</p>
        </div>
      </div>

      <!-- Customer Information Card -->
      <div style="background-color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555;">Customer Information</h3>
        <div style="display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <h4 style="margin-bottom: 10px;">Shipping Address</h4>
            <p style="margin: 0; font-size: 14px; color: #777;">${
              paymentData.firstName
            } ${paymentData.lastName}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #777;">${
              paymentData.address
            }</p>
          </div>
         <div style="margin-top: 20px;">
          <h4 style="margin-bottom: 10px;">Delivery Date</h4>
          <p style="margin: 5px 0; font-size: 14px; color: #777;">${
            paymentData.deliveryDate
          }</p>
          <h4 style="margin-bottom: 10px;">Shipping Method</h4>
          <p style="margin: 0; font-size: 14px; color: #777;">${
            paymentData.deliveryOption
          }</p>
        </div>
        </div>
        
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px;">
        <p style="font-size: 14px; color: #777;">Best regards,<br>Sindhus Kitchen</p>
      </div>
    </div>
  `,
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
