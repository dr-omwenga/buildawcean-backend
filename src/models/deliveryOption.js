import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const DeliveryOption = sequelize.define("DeliveryOption", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  deliveryDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  priceCents: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

export default DeliveryOption;