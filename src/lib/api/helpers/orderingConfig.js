export function formatOrderingResponse(ordering = {}) {
  const rawAccepted = ordering.acceptedTypes;
  const acceptedTypes = Array.isArray(rawAccepted)
    ? rawAccepted
    : ["DINE_IN", "TAKEAWAY", "DELIVERY"];
  const defaultType = (ordering.defaultType && acceptedTypes.includes(ordering.defaultType))
    ? ordering.defaultType
    : (acceptedTypes.length > 0 ? acceptedTypes[0] : null);

  const isDineInAccepted = acceptedTypes.includes("DINE_IN");
  const isTakeawayAccepted = acceptedTypes.includes("TAKEAWAY");
  const isDeliveryAccepted = acceptedTypes.includes("DELIVERY");

  const extractFee = (chargeConfig, orderType, feeKey, existingTypeConfig, isPercent = false) => {
    const typeKey = orderType === "DINE_IN" ? "dineIn" : orderType === "TAKEAWAY" ? "takeaway" : "delivery";
    const directType = chargeConfig?.[typeKey];
    const orderTypeObj = chargeConfig?.orderTypes?.[orderType];
    const existingType = existingTypeConfig?.[feeKey];

    let nested = null;
    if (directType?.isEnabled) {
      nested = directType;
    } else if (orderTypeObj?.isEnabled) {
      nested = orderTypeObj;
    } else if (existingType?.isEnabled) {
      nested = existingType;
    } else {
      nested = directType || orderTypeObj || existingType;
    }

    if (nested !== undefined && nested !== null && typeof nested === "object") {
      const isEnabled = Boolean(nested.isEnabled);
      const amount = Number(nested.amount ?? (chargeConfig?.amount || 0));
      return {
        isEnabled,
        amount,
        ...(isPercent ? { percentage: Number(nested.percentage ?? nested.amount ?? (chargeConfig?.amount || 0)) } : {})
      };
    }

    if (!chargeConfig) return { isEnabled: false, amount: 0, ...(isPercent ? { percentage: 0 } : {}) };

    const isApplicable = Array.isArray(chargeConfig.applicableOrderTypes)
      ? chargeConfig.applicableOrderTypes.includes(orderType)
      : true;
    const isEnabled = Boolean(chargeConfig.isEnabled && isApplicable);
    const amount = Number(chargeConfig.amount || 0);

    return {
      isEnabled,
      amount,
      ...(isPercent ? { percentage: amount } : {})
    };
  };

  const extractMov = (movConfig, orderType, existingTypeConfig) => {
    const typeKey = orderType === "DINE_IN" ? "dineIn" : orderType === "TAKEAWAY" ? "takeaway" : "delivery";
    const directType = movConfig?.[typeKey];
    const orderTypeObj = movConfig?.orderTypes?.[orderType];
    const existingType = existingTypeConfig?.minOrderValue;

    let nested = null;
    if (directType?.isEnabled) {
      nested = directType;
    } else if (orderTypeObj?.isEnabled) {
      nested = orderTypeObj;
    } else if (existingType?.isEnabled) {
      nested = existingType;
    } else {
      nested = directType || orderTypeObj || existingType;
    }

    if (nested !== undefined && nested !== null && typeof nested === "object") {
      return {
        isEnabled: Boolean(nested.isEnabled),
        amount: Number(nested.amount ?? (movConfig?.amount || 0))
      };
    }

    if (!movConfig) return { isEnabled: false, amount: 0 };

    return {
      isEnabled: Boolean(movConfig.isEnabled),
      amount: Number(movConfig.amount || 0)
    };
  };

  const deliveryChargeConfig = {
    isEnabled: Boolean(ordering.delivery?.deliveryCharge?.isEnabled ?? ordering.deliveryCharge?.isEnabled),
    amount: Number(ordering.delivery?.deliveryCharge?.amount ?? ordering.deliveryCharge?.amount ?? 0),
    freeDeliveryAbove: Number(ordering.delivery?.deliveryCharge?.freeDeliveryAbove ?? ordering.deliveryCharge?.freeDeliveryAbove ?? 0)
  };

  const dineInConfig = {
    isEnabled: isDineInAccepted,
    isDefault: defaultType === "DINE_IN",
    minOrderValue: extractMov(ordering.minOrderValue, "DINE_IN", ordering.dineIn),
    packingCharge: extractFee(ordering.packingCharges, "DINE_IN", "packingCharge", ordering.dineIn),
    platformFee: extractFee(ordering.platformFee, "DINE_IN", "platformFee", ordering.dineIn),
    taxAndServiceFee: extractFee(ordering.taxAndServiceFee, "DINE_IN", "taxAndServiceFee", ordering.dineIn, true)
  };

  const takeawayConfig = {
    isEnabled: isTakeawayAccepted,
    isDefault: defaultType === "TAKEAWAY",
    minOrderValue: extractMov(ordering.minOrderValue, "TAKEAWAY", ordering.takeaway),
    packingCharge: extractFee(ordering.packingCharges, "TAKEAWAY", "packingCharge", ordering.takeaway),
    platformFee: extractFee(ordering.platformFee, "TAKEAWAY", "platformFee", ordering.takeaway),
    taxAndServiceFee: extractFee(ordering.taxAndServiceFee, "TAKEAWAY", "taxAndServiceFee", ordering.takeaway, true)
  };

  const deliveryConfig = {
    isEnabled: isDeliveryAccepted,
    isDefault: defaultType === "DELIVERY",
    minOrderValue: extractMov(ordering.minOrderValue, "DELIVERY", ordering.delivery),
    deliveryCharge: deliveryChargeConfig,
    packingCharge: extractFee(ordering.packingCharges, "DELIVERY", "packingCharge", ordering.delivery),
    platformFee: extractFee(ordering.platformFee, "DELIVERY", "platformFee", ordering.delivery),
    taxAndServiceFee: extractFee(ordering.taxAndServiceFee, "DELIVERY", "taxAndServiceFee", ordering.delivery, true)
  };
  
  const cleanOrdering = { ...ordering };
  delete cleanOrdering.deliveryCharge;
  delete cleanOrdering.packingCharges;
  delete cleanOrdering.platformFee;
  delete cleanOrdering.taxAndServiceFee;
  delete cleanOrdering.minOrderValue;
  delete cleanOrdering.orderTypes;

  return {
    ...cleanOrdering,
    acceptedTypes,
    defaultType,
    dineIn: dineInConfig,
    takeaway: takeawayConfig,
    delivery: deliveryConfig
  };
}
