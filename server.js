import app from "./src/app.js";
import dotenv from "dotenv";
import sequelize from "./src/models/index.js";
import "./src/models/user.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Sync DB after model registration
await sequelize.sync();

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});