import CartItem from "../models/cart.js";
import Product from "../models/product.js";
import DeliveryOption from "../models/deliveryOption.js";


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

    // Optional expansion: replace productId-only cart entries with full product fields.
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
    // Snapshot cart before mutation so frontend can compare old vs new state.
    const cart = (await CartItem.findAll()).map((item) => item.toJSON());

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

    // Upsert behavior by productId: increment existing quantity, otherwise create new row.
    const existingCartItem = await CartItem.findByPk(productId);
    let cartItem;
    let statusCode;

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
      cartItem = existingCartItem.toJSON();
      statusCode = 200;
    } else {
      const createdCartItem = await CartItem.create({
        productId,
        quantity,
        // New cart items default to delivery option "1".
        deliveryOptionId: "1"
      });

      cartItem = createdCartItem.toJSON();
      statusCode = 201;
    }

    // Snapshot cart after mutation for frontend diff-friendly responses.
    const newCart = (await CartItem.findAll()).map((item) => item.toJSON());

    return res.status(statusCode).json({
      success: true,
      data: {
        cart,
        newCart,
        cartItem
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body || {};

    const cartItem = await CartItem.findByPk(productId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    if (quantity === undefined && deliveryOptionId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide quantity or deliveryOptionId to update"
      });
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "quantity must be an integer greater than 0"
        });
      }

      cartItem.quantity = quantity;
    }

    if (deliveryOptionId !== undefined) {
      if (typeof deliveryOptionId !== "string" || deliveryOptionId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "deliveryOptionId must be a non-empty string"
        });
      }

      const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
      if (!deliveryOption) {
        return res.status(400).json({
          success: false,
          message: "Invalid deliveryOptionId"
        });
      }

      cartItem.deliveryOptionId = deliveryOptionId;
    }

    await cartItem.save();

    return res.status(200).json({
      success: true,
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
};



export const deleteCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cartItem = await CartItem.findByPk(productId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
};
