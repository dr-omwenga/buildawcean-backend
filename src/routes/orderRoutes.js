import express from "express";
import { createOrder, getOrderById, getOrders } from "../controllers/orderControllers.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.post("/", createOrder);

export default router;
