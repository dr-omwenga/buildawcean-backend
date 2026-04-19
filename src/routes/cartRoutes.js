import express from "express";
import { addCartItem, getCart, saveCart } from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", addCartItem);
router.put("/", saveCart);

export default router;
