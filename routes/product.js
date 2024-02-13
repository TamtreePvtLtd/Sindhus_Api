var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer();

const productController = require("../controllers/api/productController");
const productControlleradmin = require("../controllers/admin/productController");
const { uploadByMulterS3 } = require("../config/s3Config");
const { useAuth } = require("../middleware/middleware");
const { paginate } = require("../controllers/pagination");
const ProductModel = require("../database/models/product");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//admin
router.post(
  "/createProduct",
  [upload.any(), useAuth],
  use(productControlleradmin.createProduct)
);

router.put(
  "/updateProduct/:productId",
  [upload.any(), useAuth],
  use(productControlleradmin.updateProduct)
);

router.delete(
  "/deleteProduct/:productId",
  useAuth,
  use(productControlleradmin.deleteProduct)
);

router.get(
  "/getAllProducts",
  useAuth,
  use(productControlleradmin.getAllProducts)
);
router.get(
  "/getProductsByMenuId",
  useAuth,
  productControlleradmin.getProductsByMenuId
);

//api
router.get(
  "/fetchProductsByMenu/:menuId/:subMenuId",
  use(productController.fetchProductsByMenu)
);

router.get(
  "/fetchProductsByCateringMenu",
  use(productController.fetchProductsByCateringMenu)
);

router.get("/searchProduct/:menuId?", use(productController.searchProduct));

router.get(
  "/getAllSnacksByMenuId/:menuId",
  use(productController.getAllSnacksByMenuId)
);

router.get(
  "/getAllSnacksMenu/:subMenuId?",
  use(productController.getAllSnacksMenu)
);

router.get(
  "/fetchProductById/:productId",
  use(productController.fetchProductById)
);

router.post("/getCateringBag", use(productController.getCateringBag));

module.exports = router;
