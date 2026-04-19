import CartItem from "../models/cart.js";
import Product from "../models/product.js";

const isValidCartItem = (item) => {
  if (!item || typeof item !== "object") {
    return false;
  }

  return (
    typeof item.productId === "string" && item.productId.trim() !== "" &&
    Number.isInteger(item.quantity) && item.quantity > 0 &&
    typeof item.deliveryOptionId === "string" && item.deliveryOptionId.trim() !== ""
  );
};

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.findAll();
    const expandValue = String(req.query.expand || "").toLowerCase();

    if (expandValue === "product" || expandValue === "products") {
      const productIds = [...new Set(cartItems.map((item) => item.productId))];
      const products = await Product.findAll({
        where: {
          id: productIds
        }
      });

      const productsById = new Map(
        products.map((product) => [product.id, product.toJSON()])
      );
      const expandedCartItems = cartItems.map((item) => {
        const productDetails = productsById.get(item.productId) || { id: item.productId };

        return {
          ...productDetails,
          quantity: item.quantity,
          deliveryOptionId: item.deliveryOptionId
        };
      });

      return res.json({ success: true, data: expandedCartItems });
    }

    res.json({ success: true, data: cartItems });
  } catch (err) {
    next(err);
  }
};

export const saveCart = async (req, res, next) => {
  try {
    const cartItems = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Cart payload must be an array of items"
      });
    }

    if (!cartItems.every(isValidCartItem)) {
      return res.status(400).json({
        success: false,
        message: "Each cart item must include productId, quantity (> 0), and deliveryOptionId"
      });
    }

    await CartItem.sequelize.transaction(async (transaction) => {
      await CartItem.destroy({ where: {}, truncate: true, transaction });
      if (cartItems.length > 0) {
        await CartItem.bulkCreate(cartItems, { transaction });
      }
    });

    return res.status(201).json({
      success: true,
      data: cartItems
    });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body || {};

    if (typeof productId !== "string" || productId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "productId is required"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "quantity must be an integer between 1 and 10"
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const existingCartItem = await CartItem.findByPk(productId);
    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + quantity;

      if (updatedQuantity > 10) {
        return res.status(400).json({
          success: false,
          message: "Final quantity cannot exceed 10"
        });
      }

      existingCartItem.quantity = updatedQuantity;
      await existingCartItem.save();

      return res.status(200).json({
        success: true,
        data: existingCartItem
      });
    }

    const createdCartItem = await CartItem.create({
      productId,
      quantity,
      deliveryOptionId: "1"
    });

    return res.status(201).json({
      success: true,
      data: createdCartItem
    });
  } catch (err) {
    next(err);
  }
};
