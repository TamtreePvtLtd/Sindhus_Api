var express = require("express");
var router = express.Router();

const shipmentController = require("../controllers/api/shipmentController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createShipment", use(shipmentController.createShipment));
router.post(
  "/createTransaction",
  use(shipmentController.createShipmentTransaction)
);
router.post("/validateAddress", use(shipmentController.validateAddress));

module.exports = router;
