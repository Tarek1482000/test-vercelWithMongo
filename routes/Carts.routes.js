const express = require("express");
const router = express.Router();

const CartsController = require("../controllers/Carts.controller");

const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

const validationSchema = require("../middelwares/validationSchema");

router.route("/").get(verifyToken, CartsController.getAllCarts);

router
  .route("/:cartId")
  .get(verifyToken, CartsController.getCart)
  .post(
    verifyToken,
    validationSchema.cartValidationSchema(),
    CartsController.addtoCart
  )
  .delete(verifyToken, CartsController.clearCartProducts);

router
  .route("/:cartId/:productId")
  .patch(verifyToken, CartsController.editCartProductCount)
  .delete(verifyToken, CartsController.reomveCartProduct);
module.exports = router;
