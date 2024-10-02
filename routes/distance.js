var express = require("express");
var router = express.Router();

const distanceController = require("../controllers/admin/distanceController");


const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createDistance", use(distanceController.createDistance));

router.put("/updateDistance/:id", use(distanceController.updateDistance));

router.delete("/deleteDistance/:id", use(distanceController.deleteDistance));

// router.get(
//   "/getAllDistances",

//   use(distanceController.getAllDistances)
// );

module.exports = router;
