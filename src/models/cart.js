import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const CartItem = sequelize.define("CartItem", {
  productId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  deliveryOptionId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

export default CartItem;
