import app from "./src/app.js";
import dotenv from "dotenv";
import sequelize from "./src/models/index.js";
import "./src/models/user.js";
import "./src/models/product.js";
import Product from "./src/models/product.js";
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});