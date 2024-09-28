const express = require("express");

const AdminsController = require("../controllers/Admins.controller");

const userRoles = require("../utils/userRoles");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

const router = express.Router();

router.route("/").get(verifyToken, AdminsController.getAllAdmins);

router
  .route("/:adminId")
  .get(verifyToken, AdminsController.getAdminData)
  .patch(
    verifyToken,
    allowTo(userRoles.ADMIN, userRoles.OWNER),
    AdminsController.UpdateAdminAccount
  )
  .delete(
    verifyToken,
    allowTo(userRoles.OWNER),
    AdminsController.DeleteAdminAccount
  );
module.exports = router;
