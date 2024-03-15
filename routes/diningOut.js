var express = require("express");
var router = express.Router();

const diningOutControlleradmin = require("../controllers/admin/diningOutController");
const diningOutController = require("../controllers/api/diningOutController");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//admin
router.post(
  "/createDiningOutProduct",
  useAuth,
  use(diningOutControlleradmin.createDiningOutProduct)
);

router.put(
  "/updateDiningOutProduct/:diningOutId",
  useAuth,
  use(diningOutControlleradmin.updateDiningOutProduct)
);

router.get(
  "/getAllDiningOutProductswithMenuData",
  useAuth,
  use(diningOutControlleradmin.getAllDiningOutProductswithMenuData)
);

router.get(
  "/getAllDiningOutMenus",
  useAuth,
  use(diningOutControlleradmin.getAllDiningOutMenus)
);

router.get(
  "/getAllDiningOutMenuWithProductDatas",
  use(diningOutControlleradmin.getAllDiningOutMenuWithProductDatas)
);

router.get(
  "/getAllDiningOutMenuDatas",
  use(diningOutController.getAllDiningOutMenuDatas)
);

router.delete(
  "/deleteDiningOutProduct/:diningOutId",
  useAuth,
  use(diningOutControlleradmin.deleteDiningOutProduct)
);

router.get(
  "/getDiningOutProductsByMenuId/:menuId",
  useAuth,
  use(diningOutControlleradmin.getDiningOutProductsByMenuId)
);

//api
// router.get(
//   "/getDiningOutProductById/:diningOutId",
//   use(diningOutController.getDiningOutProductById)
// );

router.get(
  "/getAllDiningOutProducts",
  use(diningOutController.getAllDiningOutProducts)
);
router.get(
  "/getAllDiningOutProductsMenuCard",
  use(diningOutController.getAllDiningOutProductsMenuCard)
);

router.get(
  "/fetchProductsByMenuId/:menuId",
  use(diningOutController.fetchProductsByMenuId)
);

router.get("/getDiningOutMenus", use(diningOutController.getDiningOutMenus));

router.get(
  "/searchDiningOutProduct/:menuId?",
  use(diningOutController.searchDiningOutProduct)
);

module.exports = router;
