const express = require("express");

const CustomersController = require("../controllers/Customers.controller");

const userRoles = require("../utils/userRoles");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

const router = express.Router();

router
  .route("/")
  .get(
    verifyToken,
    // allowTo(userRoles.OWNER, userRoles.ADMIN),
    CustomersController.getAllCustomers
  );

router
  .route("/:customerId")
  .get(verifyToken, CustomersController.getCustomerData)
  .patch(
    verifyToken,
    allowTo(userRoles.OWNER, userRoles.ADMIN),
    CustomersController.UpdateCustomerAccount
  )
  .delete(
    verifyToken,
    allowTo(userRoles.OWNER, userRoles.ADMIN),
    CustomersController.DeleteCustomerAccount
  );
module.exports = router;
