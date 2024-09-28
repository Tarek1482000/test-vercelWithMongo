const express = require("express");
const router = express.Router();

const OrdersController = require("../controllers/Orders.controller");

const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

router.route("/").get(verifyToken, OrdersController.getAllOrders);

router
  .route("/:orderId")
  .get(verifyToken, OrdersController.getOrder)
  .patch(verifyToken, OrdersController.editOrder);

router.route("/:cartId").post(verifyToken, OrdersController.MakeOrder);

module.exports = router;
