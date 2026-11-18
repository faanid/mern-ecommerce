import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../modules/productModel.js";

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
  const { name, price, image, brand, category, countInStock, description } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof image !== "string" ||
    !image.trim() ||
    typeof brand !== "string" ||
    !brand.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0 ||
    !Number.isInteger(Number(countInStock)) ||
    Number(countInStock) < 0
  ) {
    res.status(400);
    throw new Error("Provide valid product details, price, and stock quantity");
  }

  const product = await Product.create({
    name: name.trim(),
    price: Number(price),
    user: req.user._id,
    image: image.trim(),
    brand: brand.trim(),
    category: category.trim(),
    countInStock: Number(countInStock),
    description: description.trim(),
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

  const fields = ["name", "price", "image", "brand", "category", "countInStock", "description"];
  for (const field of fields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }

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
