import Order from "../models/order.js";
import Product from "../models/product.js";
import DeliveryOption from "../models/deliveryOption.js";
import CartItem from "../models/cart.js";
import { randomUUID } from "crypto";

// Pricing constants used when building an order total and delivery estimate.
const TAX_MULTIPLIER = 1.1;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Validates cart item shape used by POST /orders.
const isValidCartItem = (item) => {
  if (!item || typeof item !== "object") {
    return false;
  }

  return (
    typeof item.productId === "string" && item.productId.trim() !== "" &&
    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 10 &&
    typeof item.deliveryOptionId === "string" && item.deliveryOptionId.trim() !== ""
  );
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();

    // Optional expansion: attach full product details to each order line item.
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



export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Look up a single order by route param id.
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Optional expansion for a single order: attach full product details per line item.
    if (String(req.query.expand || "").toLowerCase() === "products") {
      const orderJson = order.toJSON();
      const productIds = [
        ...new Set(
          (Array.isArray(orderJson.products) ? orderJson.products : []).map((item) => item.productId)
        )
      ];

      const products = await Product.findAll({
        where: {
          id: productIds
        }
      });

      const productsById = new Map(
        products.map((product) => [product.id, product.toJSON()])
      );

      // Keep the order shape, but enrich each products[] item with product metadata.
      const expandedOrder = {
        ...orderJson,
        products: (Array.isArray(orderJson.products) ? orderJson.products : []).map((item) => ({
          ...item,
          product: productsById.get(item.productId) || null
        }))
      };

      return res.json({
        success: true,
        data: expandedOrder
      });
    }

    return res.json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    // Accept either a raw cart array body or { cart: [...] } body.
    const cart = Array.isArray(req.body) ? req.body : req.body?.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "cart must be a non-empty array"
      });
    }

    if (!cart.every(isValidCartItem)) {
      return res.status(400).json({
        success: false,
        message: "Each cart item must include productId, quantity (1-10), and deliveryOptionId"
      });
    }

    const productIds = [...new Set(cart.map((item) => item.productId))];
    const deliveryOptionIds = [...new Set(cart.map((item) => item.deliveryOptionId))];

    // Fetch referenced products and delivery options in one round trip.
    const [products, deliveryOptions] = await Promise.all([
      Product.findAll({ where: { id: productIds } }),
      DeliveryOption.findAll({ where: { id: deliveryOptionIds } })
    ]);

    const productsById = new Map(products.map((product) => [product.id, product]));
    const deliveryOptionsById = new Map(deliveryOptions.map((option) => [option.id, option]));

    // Ensure every cart reference exists before we calculate pricing.
    for (const item of cart) {
      if (!productsById.has(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid productId: ${item.productId}`
        });
      }

      if (!deliveryOptionsById.has(item.deliveryOptionId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid deliveryOptionId: ${item.deliveryOptionId}`
        });
      }
    }

    const orderTimeMs = Date.now();
    let subtotalCents = 0;

    // Build order lines and compute subtotal: (product * quantity) + shipping per line.
    const orderProducts = cart.map((item) => {
      const product = productsById.get(item.productId);
      const deliveryOption = deliveryOptionsById.get(item.deliveryOptionId);

      subtotalCents += (product.priceCents * item.quantity) + deliveryOption.priceCents;

      return {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: orderTimeMs + (deliveryOption.deliveryDays * DAY_IN_MS)
      };
    });

    const totalCostCents = Math.round(subtotalCents * TAX_MULTIPLIER);

    // Persist the order and clear the cart as one atomic operation.
    const order = await Order.sequelize.transaction(async (transaction) => {
      const createdOrder = await Order.create({
        id: randomUUID(),
        orderTimeMs,
        totalCostCents,
        products: orderProducts
      }, { transaction });

      await CartItem.destroy({ where: {}, truncate: true, transaction });
      return createdOrder;
    });

    return res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};
