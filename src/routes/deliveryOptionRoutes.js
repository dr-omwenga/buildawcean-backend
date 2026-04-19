import express from "express";
import { getDeliveryOptions, addDeliveryOption } from "../controllers/deliveryOptionControllers.js";

const router = express.Router();

router.get("/", getDeliveryOptions);
router.post("/", addDeliveryOption);

export default router;