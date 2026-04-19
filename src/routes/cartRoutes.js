import express from "express";
import { getCart, saveCart } from "../controllers/cartControllers.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", saveCart);

export default router;
