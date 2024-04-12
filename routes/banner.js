var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer();

const bannerControlleradmin = require("../controllers/admin/bannerController");
const bannerControllerapi = require("../controllers/api/bannerController");

const { uploadByMulterS3, uploadToS3 } = require("../config/s3Config");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/createBanner",
  [upload.any()],
  use(bannerControlleradmin.createBanner)
);
router.get("/getAllBanners", use(bannerControllerapi.getAllBanners));
router. get("/getPageTitle/:bannerType",use(bannerControllerapi.getPageTitle))


module.exports = router;
