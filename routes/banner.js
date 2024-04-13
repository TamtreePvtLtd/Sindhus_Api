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
router.post(
  "/updateBanner/:id", [upload.any()],
   use(bannerControlleradmin.updateBanner)
);
router.delete(
  "/deleteBanner/:id",
  
  use(bannerControlleradmin.deleteBanner)
);
router.get("/getAllBanners", use(bannerControllerapi.getAllBanners));
router.get("/getPageTitle/:pagetitle", use(bannerControllerapi.getPageTitle));


module.exports = router;
