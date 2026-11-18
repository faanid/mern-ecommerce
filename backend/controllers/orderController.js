import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../modules/orderModel.js";
import Product from "../modules/productModel.js";

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error("An order must contain at least one item");
  }

  const requiredAddressFields = ["address", "city", "postalCode", "country"];
  if (
    !shippingAddress ||
    requiredAddressFields.some(
      (field) =>
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
    )
  ) {
    res.status(400);
    throw new Error("A complete shipping address is required");
  }

  if (typeof paymentMethod !== "string" || !paymentMethod.trim()) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  const normalizedItems = [];
  for (const item of orderItems) {
    if (
      !item ||
      typeof item !== "object" ||
      !mongoose.isValidObjectId(item.product) ||
      !Number.isInteger(Number(item.qty)) ||
      Number(item.qty) < 1
    ) {
      res.status(400);
      throw new Error("Each order item must have a valid product and quantity");
    }

    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error("One of the products in this order no longer exists");
    }
    if (product.countInStock < Number(item.qty)) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    normalizedItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: Number(item.qty),
    });
  }

  const itemsPrice = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = roundCurrency(itemsPrice * 0.15);
  const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: normalizedItems,
    shippingAddress: Object.fromEntries(
      requiredAddressFields.map((field) => [field, shippingAddress[field].trim()])
    ),
    paymentMethod: paymentMethod.trim(),
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json(order);
});

const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    !req.user.isAdmin &&
    order.user?._id?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this order");
  }

  res.json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error("Order not found");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

export { createOrder, getOrderById, getMyOrders, getOrders, updateOrderToDelivered };
