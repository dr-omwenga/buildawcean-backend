import express from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import deliveryOptionRoutes from "./deliveryOptionRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import resetRoutes from "./resetRoutes.js";
import { getPaymentSummary } from "../controllers/cartControllers.js";

const router = express.Router();

// For guidance on structuring routes,
// see: https://expressjs.com/en/guide/routing.html
router.get("/", (req, res) => {
  res.send("Go to /api/users, /api/products, /images, /api/delivery-options, /api/cart-items, /api/orders, /api/payment-summary, or /api/reset to see API routes");
});

router.get("/payment-summary", getPaymentSummary);

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/delivery-options", deliveryOptionRoutes);
router.use("/cart-items", cartRoutes);
router.use("/cart-item", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reset", resetRoutes);


export default router;