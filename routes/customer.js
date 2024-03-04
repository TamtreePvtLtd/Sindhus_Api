var express = require("express");
var router = express.Router();

const adminCustomersController = require("../controllers/admin/customerController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//Admin
router.post("/adminLogin", use(adminCustomersController.adminLogin));
router.post("/signup", use(adminCustomersController.signUp));
router.get("/isAuthorized", use(adminCustomersController.isAuthorized));
router.get("/logout", use(adminCustomersController.logout));

module.exports = router;
