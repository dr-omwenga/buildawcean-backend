import express from "express";
import { addCartItem, getCart, saveCart, updateCartItem } from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", addCartItem);
router.put("/", saveCart);
router.put("/:productId", updateCartItem);

export default router;
