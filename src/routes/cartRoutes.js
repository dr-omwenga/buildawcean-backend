import express from "express";
import { addCartItem, deleteCartItem, getCart, saveCart, updateCartItem } from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", addCartItem);
router.put("/", saveCart);
router.put("/:productId", updateCartItem);
router.delete("/:productId", deleteCartItem);

export default router;
