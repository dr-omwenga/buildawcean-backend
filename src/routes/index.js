import express from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import imageRoutes from "./imageRoutes.js";

const router = express.Router();

// For guidance on structuring routes,
// see: https://expressjs.com/en/guide/routing.html
router.get("/", (req, res) => {
  res.send("Go to /users, /products, or /images to see API routes");
});


router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/images", imageRoutes);


export default router;