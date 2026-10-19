import mongoose from "mongoose";
import Table from "@/models/Table";
import MenuItem from "@/models/Item";
import { User } from "@/models/User";
import { BadRequestError, NotFoundError } from "@/lib/api/response-handler";

export const resolveTable = async (restaurantId, orderType, tableInput) => {
  if (orderType !== "DINE_IN") return null;
  if (!tableInput) {
    throw new BadRequestError("Table is required for dine-in orders");
  }

  let tableDoc = null;
  if (mongoose.Types.ObjectId.isValid(tableInput)) {
    tableDoc = await Table.findOne({ _id: tableInput, restaurant: restaurantId });
  }
  if (!tableDoc && typeof tableInput === "string") {
    tableDoc = await Table.findOne({ qrToken: tableInput, restaurant: restaurantId });
  }
  if (!tableDoc && !isNaN(Number(tableInput))) {
    tableDoc = await Table.findOne({ tableNumber: Number(tableInput), restaurant: restaurantId });
  }

  if (!tableDoc) {
    throw new NotFoundError("Specified table not found for this restaurant");
  }

  return tableDoc._id;
};

export const normalizeDeliveryAddress = (address) => {
  if (!address || typeof address !== "object") return null;

  const street = (
    address.street ||
    address.addressLine1 ||
    address.formattedAddress ||
    address.address ||
    ""
  ).trim();

  const city = (address.city || "").trim();
  const state = (address.state || "").trim();
  const zipCode = (
    address.zipCode ||
    address.postalCode ||
    address.pincode ||
    address.zip ||
    ""
  ).toString().trim();

  const label = (address.label || "").trim();
  const instructions = (
    address.instructions ||
    address.deliveryInstructions ||
    ""
  ).trim();

  return {
    street,
    city,
    state,
    zipCode,
    label,
    instructions,
  };
};

export const validateAndCalculateItems = async (restaurantId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("Order must contain at least one item");
  }

  const itemIds = items.map((i) => i.menuItem || i._id).filter(Boolean);
  const dbMenuItems = await MenuItem.find({
    _id: { $in: itemIds },
    restaurant: restaurantId,
  })
    .select("name base_price isAvailable dietaryType variants")
    .lean();

  const dbMenuItemMap = new Map(dbMenuItems.map((i) => [i._id.toString(), i]));

  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const rawItem of items) {
    const menuItemId = (rawItem.menuItem || rawItem._id || "").toString();
    const dbItem = dbMenuItemMap.get(menuItemId);

    if (!dbItem) {
      throw new BadRequestError(`Menu item '${rawItem.name || menuItemId}' is invalid or no longer available`);
    }

    const quantity = Math.max(1, parseInt(rawItem.quantity || 1, 10));
    let unitPrice = Number(rawItem.unitPrice ?? dbItem.base_price);

    let validatedVariant = undefined;
    if (rawItem.variant && rawItem.variant.name) {
      validatedVariant = {
        name: String(rawItem.variant.name).trim(),
        price: Number(rawItem.variant.price) || 0,
      };
      if (validatedVariant.price > 0) {
        unitPrice = validatedVariant.price;
      }
    }

    const validatedAddons = [];
    let addonsTotal = 0;
    if (Array.isArray(rawItem.addons)) {
      for (const addon of rawItem.addons) {
        if (addon && addon.name) {
          const addonPrice = Math.max(0, Number(addon.price) || 0);
          const isFree = Boolean(addon.isFree);
          const validDietaryTypes = ["veg", "non-veg", "egg", "vegan"];
          const dietaryType = validDietaryTypes.includes(addon.dietaryType) ? addon.dietaryType : "veg";

          validatedAddons.push({
            name: String(addon.name).trim(),
            price: addonPrice,
            isFree: isFree,
            dietaryType: dietaryType,
          });
          addonsTotal += addonPrice;
        }
      }
    }

    const lineTotalPrice = Math.round((unitPrice + addonsTotal) * quantity * 100) / 100;
    calculatedSubtotal += lineTotalPrice;

    validatedItems.push({
      menuItem: dbItem._id,
      name: (rawItem.name || dbItem.name).trim(),
      quantity,
      unitPrice,
      variant: validatedVariant,
      addons: validatedAddons,
      specialInstructions: (rawItem.specialInstructions || "").trim(),
      totalPrice: lineTotalPrice,
    });
  }

  return {
    validatedItems,
    calculatedSubtotal: Math.round(calculatedSubtotal * 100) / 100,
  };
};

export const calculateOrderCharges = ({
  orderType,
  subtotal,
  orderingConfig = {},
  rawCharges = null,
  rawDeliveryFee = null,
  rawDeliveryCharge = null,
  rawPackingCharge = null,
  rawPackingCharges = null,
  rawPlatformFee = null,
  rawTax = null,
  rawDiscount = 0,
}) => {
  const typeConfig =
    orderType === "DINE_IN"
      ? orderingConfig.dineIn
      : orderType === "TAKEAWAY"
      ? orderingConfig.takeaway
      : orderingConfig.delivery;

  // 1. Delivery Fee
  let deliveryFee = 0;
  if (orderType === "DELIVERY") {
    const deliveryChargeConfig = typeConfig?.deliveryCharge;
    const isFreeDelivery =
      deliveryChargeConfig?.isEnabled &&
      Number(deliveryChargeConfig.freeDeliveryAbove || 0) > 0 &&
      subtotal >= Number(deliveryChargeConfig.freeDeliveryAbove);

    if (isFreeDelivery) {
      deliveryFee = 0;
    } else if (rawDeliveryFee !== null && rawDeliveryFee !== undefined) {
      deliveryFee = Math.max(0, Number(rawDeliveryFee));
    } else if (rawDeliveryCharge !== null && rawDeliveryCharge !== undefined) {
      deliveryFee = Math.max(0, Number(rawDeliveryCharge));
    } else if (rawCharges?.deliveryFee !== undefined && rawCharges.deliveryFee !== null) {
      deliveryFee = Math.max(0, Number(rawCharges.deliveryFee));
    } else if (deliveryChargeConfig?.isEnabled) {
      deliveryFee = Math.max(0, Number(deliveryChargeConfig.amount || 0));
    }
  }

  // 2. Packing Charge
  let packingCharge = 0;
  if (rawPackingCharge !== null && rawPackingCharge !== undefined) {
    packingCharge = Math.max(0, Number(rawPackingCharge));
  } else if (rawPackingCharges !== null && rawPackingCharges !== undefined) {
    packingCharge = Math.max(0, Number(rawPackingCharges));
  } else if (rawCharges?.packingCharge !== undefined && rawCharges.packingCharge !== null) {
    packingCharge = Math.max(0, Number(rawCharges.packingCharge));
  } else if (typeConfig?.packingCharge?.isEnabled) {
    packingCharge = Math.max(0, Number(typeConfig.packingCharge.amount || 0));
  }

  // 3. Platform Fee
  let platformFee = 0;
  if (rawPlatformFee !== null && rawPlatformFee !== undefined) {
    platformFee = Math.max(0, Number(rawPlatformFee));
  } else if (rawCharges?.platformFee !== undefined && rawCharges.platformFee !== null) {
    platformFee = Math.max(0, Number(rawCharges.platformFee));
  } else if (typeConfig?.platformFee?.isEnabled) {
    platformFee = Math.max(0, Number(typeConfig.platformFee.amount || 0));
  }

  // 4. Tax & Service Fee
  let tax = 0;
  if (rawTax !== null && rawTax !== undefined && Number(rawTax) >= 0) {
    tax = Math.max(0, Number(rawTax));
  } else if (rawCharges?.tax !== undefined && rawCharges.tax !== null && Number(rawCharges.tax) >= 0) {
    tax = Math.max(0, Number(rawCharges.tax));
  } else if (typeConfig?.taxAndServiceFee?.isEnabled) {
    const taxRate = Number(
      typeConfig.taxAndServiceFee.percentage ?? typeConfig.taxAndServiceFee.amount ?? 0
    );
    tax = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  }

  // 5. Discount
  const discount = Math.max(0, Number(rawDiscount) || 0);

  // Round charges to 2 decimal places
  deliveryFee = Math.round(deliveryFee * 100) / 100;
  packingCharge = Math.round(packingCharge * 100) / 100;
  platformFee = Math.round(platformFee * 100) / 100;
  tax = Math.round(tax * 100) / 100;

  const calculatedTotal = Math.max(
    0,
    Math.round((subtotal + deliveryFee + packingCharge + platformFee + tax - discount) * 100) / 100
  );

  return {
    charges: {
      deliveryFee,
      packingCharge,
      platformFee,
    },
    tax,
    discount,
    totalAmount: calculatedTotal,
  };
};

export const resolveCustomer = async (customerId, customerInfo) => {
  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
    return customerId;
  }

  const phone = customerInfo?.phone ? String(customerInfo.phone).trim() : null;
  if (phone) {
    try {
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({
          phone,
          name: (customerInfo.name || "Guest Customer").trim(),
          email: customerInfo.email ? customerInfo.email.trim().toLowerCase() : undefined,
        });
      }
      return user._id;
    } catch (err) {
      console.warn("Could not auto-create customer record:", err?.message);
    }
  }
  return null;
};
