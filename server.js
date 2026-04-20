import app from "./src/app.js";
import dotenv from "dotenv";
import sequelize from "./src/models/index.js";
import "./src/models/user.js";
import "./src/models/product.js";
import "./src/models/deliveryOption.js";
import "./src/models/cart.js";
import "./src/models/order.js";
import Product from "./src/models/product.js";
import DeliveryOption from "./src/models/deliveryOption.js";
import CartItem from "./src/models/cart.js";
import Order from "./src/models/order.js";
import { defaultDeliveryOptions } from "./defaultData/defaultDeliveryOptions.js";
import { defaultCart } from "./defaultData/defaultCart.js";
import { defaultOrders } from "./defaultData/defaultOrders.js";
import fs from "fs";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Sync DB after model registration
await sequelize.sync();

// Load default products if none exist
const productCount = await Product.count();
if (productCount === 0) {
  try {
    const productsData = JSON.parse(fs.readFileSync("./backend/products.json", "utf8"));
    await Product.bulkCreate(productsData);
    console.log("Default products loaded into database");
  } catch (error) {
    console.error("Error loading default products:", error);
  }
}

// Load default delivery options if none exist
const deliveryOptionCount = await DeliveryOption.count();
if (deliveryOptionCount === 0) {
  try {
    await DeliveryOption.bulkCreate(defaultDeliveryOptions);
    console.log("Default delivery options loaded into database");
  } catch (error) {
    console.error("Error loading default delivery options:", error);
  }
}

// Load default cart if empty
const cartItemCount = await CartItem.count();
if (cartItemCount === 0) {
  try {
    if (Array.isArray(defaultCart) && defaultCart.length > 0) {
      await CartItem.bulkCreate(defaultCart);
      console.log("Default cart loaded into database");
    }
  } catch (error) {
    console.error("Error loading default cart:", error);
  }
}

// Load default orders if empty
const orderCount = await Order.count();
if (orderCount === 0) {
  try {
    if (Array.isArray(defaultOrders) && defaultOrders.length > 0) {
      await Order.bulkCreate(defaultOrders);
      console.log("Default orders loaded into database");
    }
  } catch (error) {
    console.error("Error loading default orders:", error);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});