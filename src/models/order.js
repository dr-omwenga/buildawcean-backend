import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  orderTimeMs: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  totalCostCents: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  timestamps: false
});

export default Order;
