import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../modules/productModel.js";
import { validateProductFields } from "../utils/validation.js";

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { data, error } = validateProductFields(req.body);
  if (error) {
    res.status(400);
    throw new Error(error);
  }

  const product = await Product.create({
    ...data,
    user: req.user._id,
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { data, error } = validateProductFields(req.body, { partial: true });
  if (error) {
    res.status(400);
    throw new Error(error);
  }
  if (Object.keys(data).length === 0) {
    res.status(400);
    throw new Error("At least one valid product field is required");
  }

  Object.assign(product, data);
  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product removed" });
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
