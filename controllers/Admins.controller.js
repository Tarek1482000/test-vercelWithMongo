const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const UsersDB = require("../models/user.model");
const CartsDB = require("../models/cart.model");
const OrdersDB = require("../models/order.model");

const getAllAdmins = asyncWrapper(async (req, res) => {
  const query = req.query;
  const Limit = query.limit || 10;
  const Page = query.page || 1;
  const Skip = (Page - 1) * Limit;

  const admins = await UsersDB.find({ role: "ADMIN" }).limit(Limit).skip(Skip);

  if (!admins) {
    const error = appError.create("Something Wrong", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, admins });
});

const getAdminData = asyncWrapper(async (req, res, next) => {
  const adminId = req.params.adminId;
  const admin = await UsersDB.findOne({ role: "ADMIN", _id: adminId });
  if (!admin) {
    const error = appError.create("admin not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, admin });
});

const UpdateAdminAccount = asyncWrapper(async (req, res, next) => {
  const adminId = req.params.adminId;
  const updatedAdminData = await UsersDB.findOneAndUpdate(
    { role: "ADMIN", _id: adminId },
    { $set: { ...req.body } },
    { new: true }
  );

  if (!updatedAdminData) {
    const error = appError.create("Admin not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, updatedAdminData });
});

const DeleteAdminAccount = asyncWrapper(async (req, res, next) => {
  const adminId = req.params.adminId;

  const Admin = await UsersDB.findOne({
    role: "ADMIN",
    _id: adminId,
  });
  if (!Admin) {
    const error = appError.create("Admin not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  for (let i = 0; Admin.ordersId[i]; i++) {
    const order = await OrdersDB.findById(Admin.ordersId[i]);
    if (order.state === "In Progress") {
      const error = appError.create(
        "can't delete user not finished the order",
        401,
        httpStatusText.ERROR
      );
      return next(error);
    }
  }

  const deletedAdmin = await UsersDB.findOneAndDelete({
    role: "ADMIN",
    _id: adminId,
  });
  if (!deletedAdmin) {
    const error = appError.create("Something wrong", 401, httpStatusText.ERROR);
    return next(error);
  }

  const deleteAdminCart = await CartsDB.findOneAndDelete({
    userId: adminId,
  });

  if (!deleteAdminCart) {
    const error = appError.create(
      "admin cart not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, deletedAdmin });
});

module.exports = {
  getAllAdmins,
  getAdminData,
  UpdateAdminAccount,
  DeleteAdminAccount,
};
