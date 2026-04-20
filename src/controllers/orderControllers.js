import Order from "../models/order.js";
import Product from "../models/product.js";

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();

    if (String(req.query.expand || "").toLowerCase() === "products") {
      const allProductIds = [
        ...new Set(
          orders.flatMap((order) =>
            Array.isArray(order.products)
              ? order.products.map((item) => item.productId)
              : []
          )
        )
      ];

      const products = await Product.findAll({
        where: {
          id: allProductIds
        }
      });

      const productsById = new Map(
        products.map((product) => [product.id, product.toJSON()])
      );

      const expandedOrders = orders.map((order) => {
        const orderJson = order.toJSON();

        return {
          ...orderJson,
          products: (Array.isArray(orderJson.products) ? orderJson.products : []).map((item) => ({
            ...item,
            product: productsById.get(item.productId) || null
          }))
        };
      });

      return res.json({ success: true, data: expandedOrders });
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};
