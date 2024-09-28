const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");

const UserDB = require("../models/user.model");
const CartDB = require("../models/cart.model");

const AccountRegister = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 401, httpStatusText.ERROR);
    return next(err);
  }

  const { name, phone, address, email, username, pass } = req.body;

  const oldUserEmail = await UserDB.findOne({ email: email });
  if (oldUserEmail) {
    const err = appError.create("user already exist", 400, httpStatusText.FAIL);
    return next(err);
  }

  const oldUserName = await UserDB.findOne({ username: username });
  if (oldUserName) {
    const err = appError.create(
      "username already exist",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const hashedPassward = await bcrypt.hash(pass, 10);

  const cart = new CartDB();

  if (!cart) {
    const err = appError.create("Something Wrong", 400, httpStatusText.FAIL);
    return next(err);
  }

  const newUser = new UserDB({
    name,
    phone,
    address,
    email,
    username,
    pass: hashedPassward,
    cartId: cart._id,
  });
  cart.userId = newUser._id;

  // Generat JWT  token
  // const token = await generateJWT({
  //   id: newUser._id,
  //   email: newUser.email,
  //   role: newUser.role,
  // });

  // newUser.token = token;

  await cart.save();
  await newUser.save();

  res.status(201).json({ status: httpStatusText.SUCCESS, newUser });
});

const AccountLogin = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 401, httpStatusText.ERROR);
    return next(err);
  }

  const { email, pass } = req.body;

  if (!email && !pass) {
    const err = appError.create(
      "username and passward are required",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }
  const user = await UserDB.findOne({ email: email });
  if (!user) {
    const err = appError.create("User not found", 400, httpStatusText.FAIL);
    return next(err);
  }
  const matchedPassword = await bcrypt.compare(pass, user.pass);

  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
      cartId:user.cartId,
      name:user.name
    });
    res.json({ status: httpStatusText.SUCCESS, token });
  } else {
    const err = appError.create("Something wrong", 500, httpStatusText.ERROR);
    return next(err);
  }
});

module.exports = {
  AccountRegister,
  AccountLogin,
};
