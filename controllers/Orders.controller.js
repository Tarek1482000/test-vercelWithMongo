const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const UserDB = require("../models/user.model");
const CartsDB = require("../models/cart.model");
const OrdersDB = require("../models/order.model");
const productsDB = require("../models/product.model");

const getAllOrders = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;

  const Orders = await OrdersDB.find().limit(Limit).skip(Skip);
  if (!Orders) {
    const error = appError.create("Something wrong", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, Orders });
});

const getOrder = asyncWrapper(async (req, res, next) => {
  const Order = await OrdersDB.findById(req.params.orderId);
  if (!Order) {
    const error = appError.create("Order not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  res.json({ status: httpStatusText.SUCCESS, Order });
});

const MakeOrder = asyncWrapper(async (req, res, next) => {
  const cartId = req.params.cartId;
  const Cart = await CartsDB.findOne({ _id: cartId });
  if (!Cart) {
    const error = appError.create("Cart not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  const userId = Cart.userId;
  const User = await UserDB.findOne({ _id: userId });
  if (!User) {
    const error = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  const newOrderProducts = Cart.products.map((cartProduct) => {
    return {
      productId: cartProduct.productsId, // Assuming your Cart.products have a productId field
      count: cartProduct.count,
    };
  });

  if (newOrderProducts.length === 0) {
    const error = appError.create(
      "Can't make order without any product",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  let total_price = 0,
    i = 0;
  for (i = 0; newOrderProducts[i] != null; i++) {
    const prod_id = newOrderProducts[i].productId;
    const product = await productsDB.findOne({ _id: prod_id });

    if (product.quantity < newOrderProducts[i].count) {
      {
        let mes = `Not enough products only ${product.quantity} available for ${product.name}`;
        if (product.quantity === 0) mes = "Out of store";
        const error = appError.create(mes, 400, httpStatusText.FAIL);
        return next(error);
      }
    }
    if (newOrderProducts[i].count < 1) {
      const error = appError.create(
        "Enter a valid quantity",
        400,
        httpStatusText.FAIL
      );
      return next(error);
    }

    total_price += product.price * newOrderProducts[i].count;
    product.quantity -= newOrderProducts[i].count;
    await product.save();
  }

  const newOrder = new OrdersDB({
    userId: User._id,
    products: newOrderProducts,
    totalPrice: total_price,
  });

  User.ordersId.push(newOrder._id);

  Cart.products = [];
  await User.save();
  await newOrder.save();
  await Cart.save();
  return res.status(200).json({ status: httpStatusText.SUCCESS, newOrder });
});

const editOrder = asyncWrapper(async (req, res, next) => {
  const order_Id = req.params.orderId;
  const orderState = req.body.state;
  const orderTracking = req.body.tracking;

  const updatedOrder = await OrdersDB.findOneAndUpdate(
    { _id: order_Id },
    { $set: { state: orderState, tracking: orderTracking } },
    { new: true }
  );

  if (!updatedOrder) {
    const error = appError.create("Order not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, updatedOrder });
});

module.exports = {
  getAllOrders,
  getOrder,
  editOrder,
  MakeOrder,
};
