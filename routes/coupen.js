var express = require("express");
var router = express.Router();

const coupenController = require("../controllers/admin/coupenController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createCoupen", use(coupenController.createCoupen));

router.put("/updateCoupen/:id", use(coupenController.updateCoupen));

router.delete("/deleteCoupen/:id", use(coupenController.deleteCoupen));

router.get("/getCoupen", use(coupenController.getCoupen));

module.exports = router;
