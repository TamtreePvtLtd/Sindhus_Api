var express = require("express");
var router = express.Router();

const specialsControlleradmin = require("../controllers/admin/specialsController");
const specialsControllerUser = require("../controllers/api/specialsController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/createSpecials",
  use(specialsControlleradmin.createSpecials)
);
router.get("/getAllSpecials", use(specialsControllerUser.getAllSpecials));

module.exports = router;
