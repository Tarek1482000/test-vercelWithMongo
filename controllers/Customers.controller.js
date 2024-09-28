const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const UsersDB = require("../models/user.model");
const CartsDB = require("../models/cart.model");
const OrdersDB = require("../models/order.model");

const getAllCustomers = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;

  const customers = await UsersDB.find({ role: "CUSTOMER" })
    .limit(Limit)
    .skip(Skip);

  if (!customers) {
    const error = appError.create("Something Wrong", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.status(200).json({ status: httpStatusText.SUCCESS, customers });
});

const getCustomerData = asyncWrapper(async (req, res, next) => {
  const customerId = req.params.customerId;
  const customer = await UsersDB.findOne({ role: "CUSTOMER", _id: customerId });

  if (!customer) {
    const error = appError.create(
      "customer not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, customer });
});

const UpdateCustomerAccount = asyncWrapper(async (req, res, next) => {
  const customer_Id = req.params.customerId;
  const updatedCustomerData = await UsersDB.findOneAndUpdate(
    { role: "CUSTOMER", _id: customer_Id },
    { $set: { ...req.body } },
    { new: true }
  );

  if (!updatedCustomerData) {
    const error = appError.create(
      "customer not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, updatedCustomerData });
});

const DeleteCustomerAccount = asyncWrapper(async (req, res, next) => {
  const customer_Id = req.params.customerId;

  const Customer = await UsersDB.findOne({
    role: "CUSTOMER",
    _id: customer_Id,
  });
  if (!Customer) {
    const error = appError.create(
      "customer not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  for (let i = 0; Customer.ordersId[i]; i++) {
    const order = await OrdersDB.findById(Customer.ordersId[i]);
    if (order.state === "In Progress") {
      const error = appError.create(
        "can't delete user not finished the order",
        401,
        httpStatusText.ERROR
      );
      return next(error);
    }
  }

  const deleteCustomer = await UsersDB.findOneAndDelete({
    role: "CUSTOMER",
    _id: customer_Id,
  });
  if (!deleteCustomer) {
    const error = appError.create("Something wrong", 401, httpStatusText.ERROR);
    return next(error);
  }

  const deleteCustomerCart = await CartsDB.findOneAndDelete({
    userId: customer_Id,
  });
  if (!deleteCustomerCart) {
    const error = appError.create(
      "customer cart not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, deleteCustomer });
});

module.exports = {
  getAllCustomers,
  getCustomerData,
  UpdateCustomerAccount,
  DeleteCustomerAccount,
};
