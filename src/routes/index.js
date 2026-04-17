import express from "express";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// For guidance on structuring routes,
// see: https://expressjs.com/en/guide/routing.html
router.get("/", (req, res) => {
  res.send("Go to /users to see API root ");
});


router.use("/users", userRoutes);


export default router;