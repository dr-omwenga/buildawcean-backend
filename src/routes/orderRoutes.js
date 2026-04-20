import express from "express";
import { getOrders } from "../controllers/orderControllers.js";

const router = express.Router();

router.get("/", getOrders);

export default router;
