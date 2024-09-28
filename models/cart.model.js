const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  products: [
    {
        _id: false, // Exclude _id for subdocuments
        productsId: {
        type: String,
        unique: true, // Ensure uniqueness for productsId
      },
      count: {
        type: Number,
      },
    },
  ],
  __v: {
    type: Number,
    select: false,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
