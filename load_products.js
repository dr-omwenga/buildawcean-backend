import sequelize from "./src/models/index.js";
import Product from "./src/models/product.js";
import fs from "fs";

async function loadProducts() {
  try {
    await sequelize.sync();
    const productsData = JSON.parse(fs.readFileSync("./backend/products.json", "utf8"));
    for (const product of productsData) {
      await Product.create(product);
    }
    console.log("Products loaded successfully");
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    await sequelize.close();
  }
}

loadProducts();