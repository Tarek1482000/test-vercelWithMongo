const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const { validationResult } = require("express-validator");

const SuppliersDB = require("../models/supplier.model");

const fs = require("fs");

const path = require("path");

const getAllSupplires = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;
  const suppliers = await SuppliersDB.find().limit(Limit).skip(Skip);

  if (!suppliers) {
    const error = appError.create("Something Wrong", 404, httpStatusText.FAIL);
    return next(error);
  }

  res.json({ status: httpStatusText.SUCCESS, suppliers });
});

const getSupplierData = asyncWrapper(async (req, res, next) => {
  const supplier = await SuppliersDB.findById(req.params.supplierId);

  if (!supplier) {
    const error = appError.create(
      "Supplier not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  res.json({ status: httpStatusText.SUCCESS, supplier });
});
const AddSupplier = asyncWrapper(async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const err = appError.create(errors.array(), 400, httpStatusText.FAIL);
  //   return next(err);
  // }

  if (!req.file) {
    return next(
      appError.create("File upload failed", 400, httpStatusText.ERROR)
    );
  }

  const newSupplier = new SuppliersDB({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    logo: req.file.filename,
    email: req.body.email,
    TaxNum: req.body.TaxNum,
    website: req.body.website,
  });

  await newSupplier.save();

  return res.status(200).json({ status: httpStatusText.SUCCESS, newSupplier });
});

const UpdateSupplierData = asyncWrapper(async (req, res, next) => {
  const supplierId = req.params.supplierId;
  const updatedSupplier = await SuppliersDB.findOneAndUpdate(
    { _id: supplierId },
    { $set: { ...req.body } },
    { new: true }
  );
  if (!updatedSupplier)
    return next(
      appError.create("Supplier not found", 404, httpStatusText.FAIL)
    );

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, updatedSupplier });
});

const DeleteSupplier = asyncWrapper(async (req, res, next) => {
  const supplierId = req.params.supplierId;

  const Supplier = await SuppliersDB.findOne({
    _id: supplierId,
  });

  if (!Supplier)
    return next(
      appError.create("Supplier not found", 404, httpStatusText.FAIL)
    );

  if (Supplier.productsId.length !== 0) {
    return next(
      appError.create(
        "Can't remove supplier has products",
        400, // Change to an appropriate status code
        httpStatusText.ERROR
      )
    );
  }

  const logoName = Supplier.logo;
  const photosFolderPath = path.resolve("uploads");
  // Construct the full path to the file
  const filePath = path.join(photosFolderPath, logoName);

  // Check if the file exists before attempting to delete it
  await fs.promises.access(filePath, fs.constants.F_OK);
  // File exists, so proceed with deletion
  await fs.promises.unlink(filePath);

  const deletedSupplier = await SuppliersDB.findOneAndDelete({
    _id: supplierId,
  });

  if (!deletedSupplier) {
    return next(appError.create("Something Wrong", 400, httpStatusText.ERROR));
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, deletedSupplier });
});

module.exports = {
  getAllSupplires,
  getSupplierData,
  AddSupplier,
  UpdateSupplierData,
  DeleteSupplier,
};
