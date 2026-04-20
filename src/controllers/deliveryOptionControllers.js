import DeliveryOption from "../models/deliveryOption.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getDeliveryOptions = async (req, res, next) => {
  try {
    const deliveryOptions = await DeliveryOption.findAll();
    const expandValue = String(req.query.expand || "").toLowerCase();

    if (expandValue === "estimateddeliverytime") {
      const nowMs = Date.now();
      const expandedDeliveryOptions = deliveryOptions.map((deliveryOption) => {
        const option = deliveryOption.toJSON();

        return {
          ...option,
          estimatedDeliveryTimeMs: nowMs + (option.deliveryDays * DAY_IN_MS)
        };
      });

      return res.json({ success: true, data: expandedDeliveryOptions });
    }

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