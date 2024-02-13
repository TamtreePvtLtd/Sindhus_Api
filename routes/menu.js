var express = require("express");
var router = express.Router();

const menuControlleradmin = require("../controllers/admin/menuController");
const menuController = require("../controllers/api/menuController");
const { uploadByMulterS3 } = require("../config/s3Config");
const { paginate } = require("../controllers/pagination");
const MenuModel = require("../database/models/menu");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//admin
router.post(
  "/createMenu",
  [useAuth, uploadByMulterS3.single("image")],
  use(menuControlleradmin.createMenu)
);

router.put(
  "/updateMenu/:menuId",
  [useAuth, uploadByMulterS3.single("image")],
  use(menuControlleradmin.updateMenu)
);

router.delete(
  "/deleteMenu/:menuId",
  useAuth,
  use(menuControlleradmin.deleteMenu)
);

router.get(
  "/adminGetAllMenus",
  useAuth,
  paginate(MenuModel),
  use(menuControlleradmin.adminGetAllMenus)
);
router.get(
  "/adminGetAllMenusForAddProduct",
  useAuth,
  use(menuControlleradmin.adminGetAllMenusForAddProduct)
);

//api
router.get("/getAllMenus", use(menuController.getAllMenus));

module.exports = router;
