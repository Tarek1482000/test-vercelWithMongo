const express = require("express");
const router = express.Router();

const validationSchema = require("../middelwares/validationSchema");

const SuppliersController = require("../controllers/Suppliers.controller");

const httpStatusText = require("../utils/httpStatusText");

const userRoles = require("../utils/userRoles");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");

const appError = require("../utils/appError");

const multer = require("multer");

let Id = 1;

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const filename = `user-${Id}.${ext}`;
    cb(null, filename);
    Id++;
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(
      appError.create("File must be an image", 400, httpStatusText.ERROR),
      false
    );
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter,
});

router.route("/").get(verifyToken, SuppliersController.getAllSupplires).post(
  verifyToken,
  // allowTo(userRoles.ADMIN, userRoles.OWNER),
  validationSchema.supplierValidationSchema(),
  upload.single("logo"),
  SuppliersController.AddSupplier
);

router
  .route("/:supplierId")
  .get(verifyToken, SuppliersController.getSupplierData)
  .patch(
    verifyToken,
    // allowTo(userRoles.ADMIN, userRoles.OWNER),
    SuppliersController.UpdateSupplierData
  )
  .delete(
    verifyToken,
    // allowTo(userRoles.ADMIN, userRoles.OWNER),
    SuppliersController.DeleteSupplier
  );

module.exports = router;
