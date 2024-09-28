const httpStatusText = require("../utils/httpStatusText");

const appError = require("../utils/appError");

const asyncWrapper = require("../middelwares/asyncWrapper");

const UsersDB = require("../models/user.model");

const getOwner = asyncWrapper(async (req, res, next) => {
  const Owner = await UsersDB.findOne({ role: "OWNER" });
  if (!Owner) {
    const error = appError.create("Owner not found", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.status(200).json({ status: httpStatusText.SUCCESS, Owner });
});

const editOwnerData = asyncWrapper(async (req, res, next) => {
  const updatedOwnerData = await UsersDB.findOneAndUpdate(
    { role: "OWNER" },
    { $set: { ...req.body } },
    { new: true }
  );

  if (!updatedOwnerData) {
    const error = appError.create("Owner not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, updatedOwnerData });
});

module.exports = {
  getOwner,
  editOwnerData,
};
