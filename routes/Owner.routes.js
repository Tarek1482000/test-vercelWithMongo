const express = require("express");

const OwnerController = require("../controllers/Owner.controller");

const userRoles = require("../utils/userRoles");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

const router = express.Router();

router
  .route("/")
  .get(verifyToken, OwnerController.getOwner)
  .patch(verifyToken, allowTo(userRoles.OWNER), OwnerController.editOwnerData);

module.exports = router;
