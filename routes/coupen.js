var express = require("express");
var router = express.Router();

const coupenController = require("../controllers/admin/coupenController");
const CoupenModel = require("../database/models/coupen");
const { paginate } = require("../controllers/pagination");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createCoupen", use(coupenController.createCoupen));

router.put("/updateCoupen/:id", use(coupenController.updateCoupen));

router.delete("/deleteCoupen/:id", use(coupenController.deleteCoupen));

router.get(
  "/getAllCoupens",
  paginate(CoupenModel),
  use(coupenController.getAllCoupens)
);

module.exports = router;
