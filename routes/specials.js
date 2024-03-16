var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer();

const specialsControlleradmin = require("../controllers/admin/specialsController");
const specialsControllerUser = require("../controllers/api/specialsController");
const { uploadByMulterS3, uploadToS3 } = require("../config/s3Config");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/createSpecials",
  [upload.any()],
  use(specialsControlleradmin.createSpecials)
);
router.get("/getAllSpecials", use(specialsControllerUser.getAllSpecials));
router.delete(
  "/deleteSpecial/:specialId",

  use(specialsControlleradmin.deleteSpecial)
);
router.delete(
  "/deleteAllSpecials",
  use(specialsControlleradmin.deleteAllSpecials)
);

module.exports = router;
