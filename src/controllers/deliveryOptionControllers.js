import DeliveryOption from "../models/deliveryOption.js";

export const getDeliveryOptions = async (req, res, next) => {
  try {
    const deliveryOptions = await DeliveryOption.findAll();
    res.json({ success: true, data: deliveryOptions });
  } catch (err) {
    next(err);
  }
};

export const addDeliveryOption = async (req, res, next) => {
  try {
    const deliveryOption = await DeliveryOption.create(req.body);
    res.status(201).json({
      success: true,
      data: deliveryOption
    });
  } catch (err) {
    next(err);
  }
};