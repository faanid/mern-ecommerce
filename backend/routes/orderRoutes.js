import express from "express";
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, admin, getOrders);
router.get("/myorders", protect, getMyOrders);
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);
router.get("/:id", protect, getOrderById);

export default router;
