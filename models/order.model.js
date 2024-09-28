const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  products: [
    {
      _id: false, // Exclude _id for subdocuments
      productId: String,
      count: Number,
    },
  ],

  totalPrice: {
    type: Number,
    default: 0,
  },

  state: {
    type: String,
    default: "In Progress",
  },
  tracking: {
    type: String,
    default: "In Progress",
  },

  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model("Order", orderSchema);
