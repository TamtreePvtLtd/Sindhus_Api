var express = require("express");
var router = express.Router();

const apicateringUserController =require("../controllers/api/cateringUserController")

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//Admin
router.post(
  "/createCateringUser",
  use(apicateringUserController.createCateringUser)
);
module.exports = router;


