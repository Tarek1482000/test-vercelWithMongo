const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");
const { validationResult } = require("express-validator");

const asyncWrapper = require("../middelwares/asyncWrapper");

const ProductsDB = require("../models/product.model");
const SuppliersDB = require("../models/supplier.model");

const getAllProducts = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;
  const products = await ProductsDB.find().limit(Limit).skip(Skip);

  if (!products) {
    const error = appError.create("Something wrong", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, products });
});

const getProduct = asyncWrapper(async (req, res, next) => {
  const product = await ProductsDB.findById(req.params.productId);

  if (!product) {
    const error = appError.create(
      "Product not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, product });
});

const AddProducts = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(err);
  }

  if (req.body.colors.length === 0) {
    const err = appError.create("Colors is required", 400, httpStatusText.FAIL);
    return next(err);
  }

  if (req.body.price < 0) {
    const err = appError.create("Price is not valid", 400, httpStatusText.FAIL);
    return next(err);
  }

  if (req.body.quantity < 0) {
    const err = appError.create(
      "Quantity is not valid",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const product = await ProductsDB.findOne({ name: req.body.name });
  if (product) {
    const err = appError.create(
      "Product already exist",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const supplier = await SuppliersDB.findOne({ _id: req.body.supplierId });
  if (!supplier) {
    const err = appError.create("Supplier not exist", 400, httpStatusText.FAIL);
    return next(err);
  }

  const newProduct = new ProductsDB(req.body);
  supplier.productsId.push(newProduct._id);

  await newProduct.save();
  await supplier.save();

  return res.status(200).json({ status: httpStatusText.SUCCESS, newProduct });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.productId;

  const productFound = await ProductsDB.findOne({ name: req.body.name });
  if (productFound && productFound._id != productId) {
    const err = appError.create(
      "There is a product with this name",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const updatedProduct = await ProductsDB.findOneAndUpdate(
    { _id: productId },
    { $set: { ...req.body } },
    { new: true }
  );

  if (!updatedProduct) {
    const err = appError.create("Product not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, updatedProduct });
});

const removeProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.productId;
  const deletedProduct = await ProductsDB.findOneAndDelete({ _id: productId });

  if (!deletedProduct) {
    const err = appError.create("Product not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  const supplierId = deletedProduct.supplierId;
  const supplier = await SuppliersDB.findOne({ _id: supplierId });

  // Find the index of the product in the productsId array
  const productIndex = supplier.productsId.indexOf(productId);

  if (productIndex !== -1) {
    // Remove the product from the productsId array
    supplier.productsId.splice(productIndex, 1);
    await supplier.save();
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, deletedProduct });
});

module.exports = {
  getAllProducts,
  getProduct,
  AddProducts,
  updateProduct,
  removeProduct,
};
