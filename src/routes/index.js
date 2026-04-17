import express from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";

const router = express.Router();

// For guidance on structuring routes,
// see: https://expressjs.com/en/guide/routing.html
router.get("/", (req, res) => {
  res.send("Go to /users or /products to see API root ");
});


router.use("/users", userRoutes);
router.use("/products", productRoutes);


export default router;