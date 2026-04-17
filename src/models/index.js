import { Sequelize } from "sequelize";

// Create DB connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.db", // file-based DB
  logging: false
});

export default sequelize;