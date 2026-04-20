import sequelize from "../models/index.js";
import "../models/user.js";
import "../models/product.js";
import "../models/deliveryOption.js";
import "../models/cart.js";
import "../models/order.js";
import Product from "../models/product.js";
import DeliveryOption from "../models/deliveryOption.js";
import CartItem from "../models/cart.js";
import Order from "../models/order.js";
import { defaultProducts } from "../../defaultData/defaultProducts.js";
import { defaultDeliveryOptions } from "../../defaultData/defaultDeliveryOptions.js";
import { defaultCart } from "../../defaultData/defaultCart.js";
import { defaultOrders } from "../../defaultData/defaultOrders.js";

export const resetDatabase = async (req, res, next) => {
  try {
    const models = Object.values(sequelize.models);

    await sequelize.transaction(async (transaction) => {
      // 1) Remove all rows from every registered model table.
      for (const model of models) {
        await model.destroy({
          where: {},
          truncate: true,
          transaction
        });
      }

      // 2) Re-seed core defaults so the app is usable right after reset.
      await Product.bulkCreate(defaultProducts, { transaction });
      await DeliveryOption.bulkCreate(defaultDeliveryOptions, { transaction });
      await CartItem.bulkCreate(defaultCart, { transaction });
      await Order.bulkCreate(defaultOrders, { transaction });
    });

    return res.status(200).json({
      success: true,
      message: "Database reset complete and default data recreated"
    });
  } catch (err) {
    next(err);
  }
};
