import express from "express";
import { getImages } from "../controllers/imageControllers.js";

const router = express.Router();

// Get list of all available images
router.get("/", getImages);

export default router;
