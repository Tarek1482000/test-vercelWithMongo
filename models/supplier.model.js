const mongoose = require("mongoose");
const validator = require("validator");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "filed must be a valid email address"],
  },
  logo: {
    type: String,
  },
  TaxNum: {
    type: Number,
    required: true,
    unique: true,
  },
  website: {
    type: String,
    required: true,
    unique: true,
  },
  productsId: {
    type: Array,
  },
  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);
