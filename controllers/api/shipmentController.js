/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const Shippo = require("../../shippoClient.js");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.createShipment = async (req, res, next) => {
  const toAddress = _buildAddress(req.body);

  const missingFields = _validateRequiredFields(toAddress);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

 const addressFrom = {
    name: "SINDHU'S",
    street1: "2700 E Eldorado Pkwy #203",
    city: "Little Elm",
    state: "TX",
    zip: "75068",
    country: "US",
    phone: "2347463487",
    email: "sindhuskitchen1@gmail.com",
  };

  const parcel = {
    length: "5",
    width: "5",
    height: "5",
    distanceUnit: "in",
    weight: "2",
    massUnit: "lb",
  };

  const shipment = await Shippo.shipments.create({
    addressFrom,
    addressTo: toAddress,
    parcels: [parcel],
    async: false,
    carrierAccounts: [
      process.env.SHIPPO_CARRIER_USPS_ID,
      process.env.SHIPPO_CARRIER_UPS_ID,
    ],
  });

  return shipment;

};

// controllers/shipmentController.js
exports.createShipmentTransaction = async (rateObjId, carrierAccount) => {
  try {
    const transaction = await Shippo.transactions.create({
      rate: rateObjId,
      labelFileType: "PDF_4x6",
      async: false,
      carrierAccount: carrierAccount,
      shipment: {
        extra: {
          bypassAddressValidation: true,
        },
      },
    });

    return {
      labelUrl: transaction.labelUrl,
      objectId: transaction.objectId,
      trackingNumber: transaction.trackingNumber,
      trackingUrlProvider: transaction.trackingUrlProvider,
    };
  } catch (error) {
    throw new Error(error.message || "Error creating shipment transaction");
  }
};


exports.validateAddress = async (req, res, next) => {
  try {
    const toAddress = _buildAddress(req.body);

    const missingFields = _validateRequiredFields(toAddress);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const addressResult = await Shippo.addresses.create({
      ...toAddress,
      validate: true,
    });

    res.status(200).json(addressResult);
  } catch (error) {
    next(error);
  }
};

// required fields
// Private helper to check required fields
function _validateRequiredFields(obj, _requiredFields = []) {
  const requiredFields = [
    "name",
    "street1",
    "city",
    "state",
    "zip",
    "country",
    "phone",
    ..._requiredFields,
  ];

  return requiredFields.filter(
    (field) => !obj?.[field] || obj[field].trim() === ""
  );
}

// Private helper to build address object
function _buildAddress(address) {
  return {
    name: address.name?.trim() || "",
    street1: address.street1?.trim() || "",
    city: address.city?.trim() || "",
    state: address.state?.trim() || "",
    zip: address.zip?.trim() || "",
    country: address.country?.trim() || "",
    phone: address.phone ? address.phone : "",
    email: address.email ? address.email : "",
  };
}
