const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const { validationResult } = require("express-validator");

const CartsDB = require("../models/cart.model");
const ProductsDB = require("../models/product.model");

const getAllCarts = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;

  const Carts = await CartsDB.find().limit(Limit).skip(Skip);
  if (!Carts) {
    const error = appError.create("Something wrong", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, Carts });
});

const getCart = asyncWrapper(async (req, res, next) => {
  const Cart = await CartsDB.findById(req.params.cartId);
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, Cart });
});

const addtoCart = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }

  const cartId = req.params.cartId;
  const productId = req.body.productsId;
  const Count = req.body.count;

  if (Count < 1) {
    const error = appError.create(
      "Enter a valid quantity",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const Cart = await CartsDB.findById(cartId);
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  const Product = await ProductsDB.findById(productId);
  if (!Product) {
    const error = appError.create(
      "Product not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  if (Product.quantity < Count) {
    {
      const error = appError.create(
        `Not enough products only ${Product.quantity} available`,
        400,
        httpStatusText.FAIL
      );
      return next(error);
    }
  }

  const productIndex = Cart.products.findIndex(
    (product) => product.productsId === productId
  );

  if (productIndex !== -1) {
    const error = appError.create(
      "Product alreqdy exist",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  Cart.products.push({
    productsId: productId,
    count: Count,
  });

  await Cart.save();
  return res.status(200).json({ status: httpStatusText.SUCCESS, Cart });
});

const editCartProductCount = asyncWrapper(async (req, res, next) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;
  const newCount = req.body.count;

  if (newCount < 1) {
    const error = appError.create(
      "Enter a valid quantity",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const Cart = await CartsDB.findById(cartId);
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  if (!Cart.products.length) {
    const error = appError.create("Cart is cleared", 400, httpStatusText.FAIL);
    return next(error);
  }

  const productIndex = Cart.products.findIndex(
    (product) => product.productsId === productId
  );

  if (productIndex === -1) {
    const error = appError.create(
      "Product not found",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const product = await ProductsDB.findById(productId);
  if (product.quantity < newCount) {
    {
      const error = appError.create(
        `Not enough products only ${product.quantity} available`,
        400,
        httpStatusText.FAIL
      );
      return next(error);
    }
  }
  Cart.products[productIndex].count = newCount;
  await Cart.save();
  return res.status(200).json({ status: httpStatusText.SUCCESS, Cart });
});

const reomveCartProduct = asyncWrapper(async (req, res, next) => {
  const cartId = req.params.cartId;
  const productId = req.params.productId;

  const Cart = await CartsDB.findById(cartId);
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (!Cart.products.length) {
    const error = appError.create("Cart is cleared", 400, httpStatusText.FAIL);
    return next(error);
  }

  const productIndex = Cart.products.findIndex(
    (product) => product.productsId === productId
  );

  if (productIndex === -1) {
    const error = appError.create(
      "Product not found",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  // Remove the product at the found index
  Cart.products.splice(productIndex, 1);

  await Cart.save();

  return res.status(200).json({ status: httpStatusText.SUCCESS, Cart });
});

const clearCartProducts = asyncWrapper(async (req, res, next) => {
  const cartId = req.params.cartId;
  const Cart = await CartsDB.findById(cartId);
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  if (!Cart.products.length) {
    const error = appError.create(
      "Cart is already cleared",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  Cart.products = [];
  await Cart.save();

  return res.status(200).json({ status: httpStatusText.SUCCESS, Cart });
});

module.exports = {
  getAllCarts,
  getCart,
  addtoCart,
  editCartProductCount,
  reomveCartProduct,
  clearCartProducts,
};
