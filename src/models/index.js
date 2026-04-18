import { Sequelize } from "sequelize";

/* Create a new DB (sequelize instance) with the following configuration:
dialect: "sqlite" 
storage: "./database.db" 
logging: false 
*/
const sequelize = new Sequelize({
  dialect: "sqlite", //specify SQLite as the database type/dialect
  storage: "./database.db", // sets the path to SQLite database (file-based storage)
  logging: false // disable logging to the console for cleaner output
});

export default sequelize; // Export the configured sequelize instance for use in other parts of the application 