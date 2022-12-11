const mongoose = require("mongoose");
const { array } = require("../utils/multer");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    shortdescription: {
      type: String,
      required: true,
    },
    size: {
      type: [String],
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold:{
      type:Number,
      default:0,
    },
    fulldetails: {
      type: String,
      required: true,
    },
    group_tag: {
      type: String,
    },
    thumbnail:{
      type: String,
    },
    images: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
