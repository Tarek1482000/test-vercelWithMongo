const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "None",
  },
  price: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
   target: {
    type: String,
  },
  colors: {
    type: Array,
    required: true,
  },
  supplierId: {
    type: String,
    required: true,
  },
  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model("Product", productSchema);
