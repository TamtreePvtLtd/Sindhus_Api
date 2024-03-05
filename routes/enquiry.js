var express = require("express");
var router = express.Router();

const apiEnquiryController = require("../controllers/api/enquiryController");
const adminEnquiryController = require("../controllers/admin/enquiryController");
const { paginate } = require("../controllers/pagination");
const EnquiryModel = require("../database/enquiry");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createEnquiry", use(apiEnquiryController.createEnquiry));
router.get(
  "/getAllEnquiries",
  useAuth,
  paginate(EnquiryModel),
  use(adminEnquiryController.getAllEnquiries)
);
router.delete(
  "/deleteEnquiry/:enquiryId",
  use(adminEnquiryController.deleteEnquiry)
);
router.put(
  "/changeEnquiryisResponseStatus/:enquiryId",

  use(adminEnquiryController.changeEnquiryisResponseStatus)
);
module.exports = router;
