import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Table from "@/models/Table";
import { User } from "@/models/User";
import WebsiteConfig from "@/models/WebsiteConfig";
import { triggerPusherEvent } from "@/lib/pusher/server";
import { ImageService } from "@/services/backend/images";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { formatOrderingResponse } from "@/lib/api/helpers/orderingConfig";
import { BadRequestError, NotFoundError } from "@/lib/api/response-handler";
import Order, { OrderStatus, PaymentStatus, ORDER_TYPES } from "@/models/Order";
import { invalidateOrderCache, invalidateTableCache } from "@/lib/api/helpers/cacheKeys";
import { resolveTable, normalizeDeliveryAddress, validateAndCalculateItems, calculateOrderCharges, resolveCustomer } from "./helpers";

export const emitOrderRealtimeEvent = async (event, order) => {
  if (!order) return;
  try {
    const restaurantId = order.restaurant?._id
      ? order.restaurant._id.toString()
      : order.restaurant?.toString();
    const orderId = order._id?.toString() || order.id?.toString();
    const orderNumber = order.orderNumber;

    const channels = [];
    if (restaurantId) channels.push(`restaurant-${restaurantId}`);
    if (orderId) channels.push(`order-${orderId}`);
    if (orderNumber) channels.push(`order-${orderNumber}`);

    if (channels.length > 0) {
      await triggerPusherEvent(channels, event, {
        order,
        orderId,
        orderNumber,
        restaurantId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      });
    }
  } catch (err) {
    console.error(`[Realtime] Failed to emit '${event}':`, err?.message || err);
  }
};

const checkAndFreeTable = async (tableId, restaurantId, currentOrderId) => {
  if (!tableId) return;
  try {
    const activeOrders = await Order.countDocuments({
      table: tableId,
      orderStatus: { $nin: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED] },
      _id: { $ne: currentOrderId },
    });
    if (activeOrders === 0) {
      await Table.findByIdAndUpdate(tableId, { status: "available" });
      await invalidateTableCache(restaurantId);
    }
  } catch (err) {
    console.error("[Table Management] Error freeing table:", err?.message || err);
  }
};

const generateOrderNumber = () => {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${timestampPart}-${randomPart}`;
};

export const formatOrderResponse = (orderDoc) => {
  if (!orderDoc) return null;
  const order = orderDoc.toObject ? orderDoc.toObject({ virtuals: true }) : { ...orderDoc };

  order.id = order._id?.toString() || order.id;

  if (Array.isArray(order.items)) {
    order.items = order.items.map((item) => {
      const itemObj = { ...item };
      if (itemObj.menuItem && typeof itemObj.menuItem === "object") {
        itemObj.menuItem = {
          _id: itemObj.menuItem._id,
          name: itemObj.menuItem.name,
          base_price: itemObj.menuItem.base_price,
          dietaryType: itemObj.menuItem.dietaryType,
          image: ImageService.formatImage(itemObj.menuItem.image),
        };
      }
      return itemObj;
    });
  }

  const deliveryFee = Number(order.charges?.deliveryFee ?? order.deliveryFee ?? order.deliveryCharge ?? 0);
  const packingCharge = Number(order.charges?.packingCharge ?? order.packingCharge ?? order.packingCharges ?? 0);
  const platformFee = Number(order.charges?.platformFee ?? order.platformFee ?? 0);
  const tax = Number(order.tax ?? order.charges?.tax ?? 0);

  order.charges = {
    deliveryFee,
    packingCharge,
    platformFee,
    tax,
  };

  order.tax = tax;
  order.deliveryFee = deliveryFee;
  order.deliveryCharge = deliveryFee;
  order.packingCharge = packingCharge;
  order.packagingCharge = packingCharge;
  order.platformFee = platformFee;

  if (!order.customerInfo?.phone && order.customer?.phone) {
    order.customerInfo = {
      name: order.customerInfo?.name || order.customer?.name || "Guest Customer",
      phone: order.customer.phone,
      email: order.customerInfo?.email || order.customer?.email || "",
    };
  }

  delete order.packingCharges;

  return order;
};

const ORDER_POPULATE_FIELDS = [
  {
    path: "items.menuItem",
    select: "name base_price dietaryType image",
  },
  {
    path: "table",
    select: "tableNumber label zone",
  },
  {
    path: "customer",
    select: "name phone email profileImageUrl image",
  },
  {
    path: "restaurant",
    select: "name logo address slug upiId",
  },
  {
    path: "statusHistory.updatedByStaff",
    select: "name email role",
  },
  {
    path: "statusHistory.updatedByCustomer",
    select: "name phone email profileImageUrl",
  },
];

export const OrderService = {
  createOrder: async ({
    restaurantId,
    orderType,
    table,
    customer,
    customerInfo,
    items,
    deliveryAddress = null,
    deliveryFee: rawDeliveryFee = null,
    deliveryCharge: rawDeliveryCharge = null,
    packingCharge: rawPackingCharge = null,
    packingCharges: rawPackingCharges = null,
    platformFee: rawPlatformFee = null,
    charges: rawCharges = null,
    tax: rawTax = null,
    discount: rawDiscount = 0,
    paymentMethod = "CASH",
    paymentStatus = "PENDING",
    paymentDetails = null,
    specialInstructions = "",
    initialStatus = null,
    updatedByStaff = null,
    updatedByCustomer = null,
    skipConditionValidation = false,
  }) => {
    await dbConnect();

    if (!restaurantId) {
      throw new BadRequestError("Restaurant ID is required");
    }

    const normalizedOrderType = String(orderType || "").toUpperCase();
    if (!ORDER_TYPES.includes(normalizedOrderType)) {
      throw new BadRequestError(`Invalid order type. Must be one of: ${ORDER_TYPES.join(", ")}`);
    }

    // 1. Fetch ordering configuration
    const websiteConfig = await WebsiteConfig.findOne({ restaurant: restaurantId }).lean();
    const orderingConfig = formatOrderingResponse(websiteConfig?.ordering || {});

    const typeConfig =
      normalizedOrderType === "DINE_IN"
        ? orderingConfig.dineIn
        : normalizedOrderType === "TAKEAWAY"
        ? orderingConfig.takeaway
        : orderingConfig.delivery;

    // 2. Validate order type eligibility
    if (!skipConditionValidation) {
      const acceptedTypes = orderingConfig.acceptedTypes || [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(normalizedOrderType)) {
        throw new BadRequestError(`${normalizedOrderType.replace("_", " ")} ordering is not accepted by this restaurant`);
      }
      if (typeConfig && typeConfig.isEnabled === false) {
        throw new BadRequestError(`${normalizedOrderType.replace("_", " ")} ordering is currently disabled for this restaurant`);
      }
    }

    // 3. Resolve Dine-In Table
    const resolvedTableId = await resolveTable(restaurantId, normalizedOrderType, table);

    // 4. Validate and Normalize Delivery Address
    let resolvedDeliveryAddress = null;
    if (normalizedOrderType === "DELIVERY") {
      resolvedDeliveryAddress = normalizeDeliveryAddress(deliveryAddress);
      if (
        !resolvedDeliveryAddress ||
        !resolvedDeliveryAddress.street ||
        !resolvedDeliveryAddress.city ||
        !resolvedDeliveryAddress.zipCode
      ) {
        throw new BadRequestError("Valid delivery address with street, city, and zipCode is required for delivery orders");
      }
    }

    // 5. Validate & Calculate Items
    const { validatedItems, calculatedSubtotal } = await validateAndCalculateItems(restaurantId, items);
    const subtotal = calculatedSubtotal;

    // 6. Minimum Order Value (MOV) validation
    if (!skipConditionValidation && typeConfig?.minOrderValue?.isEnabled) {
      const minAmount = Number(typeConfig.minOrderValue.amount || 0);
      if (minAmount > 0 && subtotal < minAmount) {
        throw new BadRequestError(
          `Minimum order value for ${normalizedOrderType.replace("_", " ").toLowerCase()} is ₹${minAmount}. Current order subtotal is ₹${subtotal}.`
        );
      }
    }

    // 7. Calculate Charges, Tax, and Final Total
    const {
      charges,
      tax,
      discount,
      totalAmount,
    } = calculateOrderCharges({
      orderType: normalizedOrderType,
      subtotal,
      orderingConfig,
      rawCharges,
      rawDeliveryFee,
      rawDeliveryCharge,
      rawPackingCharge,
      rawPackingCharges,
      rawPlatformFee,
      rawTax,
      rawDiscount,
    });

    // 8. Resolve Statuses & Payment Method
    const normalizedMethod = (paymentMethod || "CASH").toUpperCase();
    let resolvedPaymentStatus;
    if (paymentStatus && !["pending", "PENDING"].includes(paymentStatus)) {
      resolvedPaymentStatus = paymentStatus.toUpperCase();
    } else if (normalizedMethod === "UPI") {
      resolvedPaymentStatus = PaymentStatus.UNVERIFIED;
    } else {
      resolvedPaymentStatus = PaymentStatus.PENDING;
    }

    let orderStatus = initialStatus || OrderStatus.PLACED;
    if (normalizedMethod === "ONLINE" && resolvedPaymentStatus !== PaymentStatus.PAID) {
      orderStatus = OrderStatus.PLACED;
    }

    // 9. Resolve Customer & CustomerInfo
    const resolvedCustomerId = await resolveCustomer(customer, customerInfo);
    const resolvedCustomerInfo = {
      name: (customerInfo?.name || "").trim(),
      phone: (customerInfo?.phone || "").trim(),
      email: (customerInfo?.email || "").trim().toLowerCase(),
    };

    // 10. Generate Identifiers
    const orderNumber = generateOrderNumber();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tokenNumber =
      (await Order.countDocuments({
        restaurant: restaurantId,
        createdAt: { $gte: today },
      })) + 1;

    // 11. Normalize Payment Details
    const resolvedPaymentDetails =
      paymentDetails && (paymentDetails.razorpay_order_id || paymentDetails.razorpayOrderId)
        ? {
            razorpayOrderId: paymentDetails.razorpay_order_id || paymentDetails.razorpayOrderId,
            razorpayPaymentId: paymentDetails.razorpay_payment_id || paymentDetails.razorpayPaymentId,
            razorpaySignature: paymentDetails.razorpay_signature || paymentDetails.razorpaySignature,
          }
        : undefined;

    // 12. Create Order in Database
    const newOrder = await Order.create({
      restaurant: restaurantId,
      orderNumber,
      tokenNumber,
      orderType: normalizedOrderType,
      table: resolvedTableId,
      deliveryAddress: resolvedDeliveryAddress,
      customer: resolvedCustomerId,
      customerInfo: resolvedCustomerInfo,
      items: validatedItems,
      subtotal,
      charges,
      tax,
      discount,
      totalAmount,
      paymentMethod: normalizedMethod,
      paymentStatus: resolvedPaymentStatus,
      paymentDetails: resolvedPaymentDetails,
      specialInstructions: (specialInstructions || "").trim(),
      orderStatus,
      statusHistory: [
        {
          statusType: "ORDER",
          status: orderStatus,
          timestamp: new Date(),
          updatedByStaff,
          updatedByCustomer,
        },
      ],
    });

    await invalidateOrderCache(restaurantId);

    if (normalizedOrderType === "DINE_IN" && resolvedTableId) {
      await Table.findByIdAndUpdate(resolvedTableId, { status: "occupied" });
      await invalidateTableCache(restaurantId);
    }

    const populatedOrder = await Order.findById(newOrder._id).populate(ORDER_POPULATE_FIELDS);
    const formattedOrder = formatOrderResponse(populatedOrder);

    emitOrderRealtimeEvent("order:created", formattedOrder);
    return formattedOrder;
  },

  getOrderById: async (orderId, { restaurantId = null, customerId = null } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;
    if (customerId) query.customer = customerId;

    const order = await Order.findOne(query).populate(ORDER_POPULATE_FIELDS);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return formatOrderResponse(order);
  },

  getOrderByNumber: async (orderNumber, { restaurantId = null } = {}) => {
    await dbConnect();

    const query = { orderNumber: orderNumber.trim().toUpperCase() };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query).populate(ORDER_POPULATE_FIELDS);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return formatOrderResponse(order);
  },
  
  getOrderByRazorpayId: async (razorpayOrderId, { restaurantId = null } = {}) => {
    await dbConnect();

    const query = { "paymentDetails.razorpayOrderId": razorpayOrderId.trim() };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query).populate(ORDER_POPULATE_FIELDS);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return formatOrderResponse(order);
  },

  getOrderDetails: async (identifier, options = {}) => {
    if (!identifier) throw new BadRequestError("Order identifier is required");
    const id = String(identifier).trim();
    if (id.startsWith("ORD-")) {
      return OrderService.getOrderByNumber(id, options);
    }
    if (id.startsWith("order_")) {
      return OrderService.getOrderByRazorpayId(id, options);
    }
    return OrderService.getOrderById(id, options);
  },

  listOrders: async ({
    restaurantId,
    restaurantIds,
    customerId,
    status,
    orderType,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    summary = false,
  }) => {
    await dbConnect();

    const fetchOrders = async () => {
      const query = {};
      if (restaurantIds) {
        query.restaurant = {
          $in: Array.isArray(restaurantIds)
            ? restaurantIds
            : restaurantIds.split(",").map((id) => id.trim()),
        };
      } else if (restaurantId) {
        query.restaurant = restaurantId;
      }
      if (customerId) query.customer = customerId;

      if (status) {
        if (status.includes(",")) {
          query.orderStatus = { $in: status.split(",").map((s) => s.trim().toUpperCase()) };
        } else {
          query.orderStatus = status.trim().toUpperCase();
        }
      }

      if (orderType) {
        query.orderType = orderType.trim().toUpperCase();
      }

      if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { orderNumber: searchRegex },
          { "customerInfo.name": searchRegex },
          { "customerInfo.phone": searchRegex },
        ];
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      if (summary) {
        const orders = await Order.find(query)
          .sort({ createdAt: -1 })
          .select("orderNumber orderStatus totalAmount createdAt paymentStatus paymentMethod orderType");
        return {
          orders: orders.map((o) => ({
            id: o._id,
            orderNumber: o.orderNumber,
            status: o.orderStatus,
            total: o.totalAmount,
            date: o.createdAt,
            paymentStatus: o.paymentStatus,
            paymentMethod: o.paymentMethod,
            type: o.orderType,
          })),
          total: orders.length,
        };
      }

      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
      const skip = (safePage - 1) * safeLimit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate(ORDER_POPULATE_FIELDS)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safeLimit),
        Order.countDocuments(query),
      ]);

      return {
        orders: orders.map(formatOrderResponse),
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      };
    };

    if (restaurantIds) {
      const data = await fetchOrders();
      return { ...data, isCached: false };
    }

    const cacheKey = `restaurant:${restaurantId}:orders:page:${page}:limit:${limit}:status:${status || "all"}:type:${orderType || "all"}:search:${search || "none"}:start:${startDate || "all"}:end:${endDate || "all"}:summary:${summary}:customer:${customerId || "all"}`;

    const { data: cachedOrFetchedData, isCached } = await getOrSetCache(
      cacheKey,
      fetchOrders,
      120
    );

    return { ...cachedOrFetchedData, isCached };
  },

  getCustomerOrders: async ({
    restaurantId = null,
    customerId = null,
    phone = null,
    status = null,
    page = 1,
    limit = 20,
  }) => {
    await dbConnect();

    if (!customerId && !phone) {
      throw new BadRequestError("Customer ID or phone number is required");
    }

    const query = {};
    if (restaurantId) query.restaurant = restaurantId;

    const customerConditions = [];
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      customerConditions.push({ customer: new mongoose.Types.ObjectId(customerId) });
    }

    if (phone) {
      const cleanPhone = String(phone).trim();
      const usersWithPhone = await User.find({ phone: cleanPhone }).select("_id").lean();
      const userIds = usersWithPhone.map((u) => u._id);
      if (userIds.length > 0) {
        customerConditions.push({ customer: { $in: userIds } });
      }
      customerConditions.push({ "customerInfo.phone": cleanPhone });
    }

    if (customerConditions.length > 0) {
      if (customerConditions.length === 1) {
        Object.assign(query, customerConditions[0]);
      } else {
        query.$or = customerConditions;
      }
    }

    if (status) {
      if (status.includes(",")) {
        query.orderStatus = { $in: status.split(",").map((s) => s.trim().toUpperCase()) };
      } else {
        query.orderStatus = status.trim().toUpperCase();
      }
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate(ORDER_POPULATE_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders.map(formatOrderResponse),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  },

  advanceOrderState: async (orderId, { updatedByStaff = null, restaurantId = null } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const { orderStatus, orderType } = order;

    const TRANSITION_MAP = {
      DINE_IN: [
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.SERVED,
        OrderStatus.COMPLETED,
      ],
      TAKEAWAY: [
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.PICKED_UP,
        OrderStatus.COMPLETED,
      ],
      DELIVERY: [
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
      ],
    };

    const normalizedOrderType = (orderType || "").toUpperCase();
    const flow = TRANSITION_MAP[normalizedOrderType];
    if (!flow) {
      throw new BadRequestError(`Unknown order type: ${orderType}`);
    }

    const currentIndex = flow.indexOf(orderStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) {
      throw new BadRequestError("Order cannot be advanced further or is in a terminal state");
    }

    const nextStatus = flow[currentIndex + 1];
    const now = new Date();

    if (orderStatus === OrderStatus.PLACED && nextStatus === OrderStatus.ACCEPTED) {
      order.statusHistory.push({
        statusType: "ORDER",
        status: OrderStatus.ACCEPTED,
        timestamp: now,
        updatedByStaff,
      });
      order.orderStatus = OrderStatus.PREPARING;
      order.statusHistory.push({
        statusType: "ORDER",
        status: OrderStatus.PREPARING,
        timestamp: now,
        updatedByStaff,
      });
    } else {
      order.orderStatus = nextStatus;
      order.statusHistory.push({
        statusType: "ORDER",
        status: nextStatus,
        timestamp: now,
        updatedByStaff,
      });
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    if (order.orderStatus === OrderStatus.COMPLETED && order.orderType === "DINE_IN" && order.table) {
      await checkAndFreeTable(order.table, order.restaurant, order._id);
    }

    const updatedOrder = await OrderService.getOrderById(order._id);
    emitOrderRealtimeEvent("order:updated", updatedOrder);

    return updatedOrder;
  },

  processOrderUpdate: async (
    orderId,
    { action, reason, paymentStatus, paymentMethod, restaurantId, updatedByStaff }
  ) => {
    const ACTION_HANDLERS = {
      advance: () => OrderService.advanceOrderState(orderId, { updatedByStaff, restaurantId }),
      reject: () => OrderService.rejectOrder(orderId, { rejectedBy: updatedByStaff, restaurantId, reason }),
      cancel: () => OrderService.cancelOrder(orderId, { cancelledBy: updatedByStaff, restaurantId, reason }),
    };

    const hasPaymentUpdate = paymentStatus || paymentMethod;
    const handler = ACTION_HANDLERS[action];

    if (!handler && !hasPaymentUpdate) {
      throw new BadRequestError("No valid action or update fields provided");
    }

    let updatedOrder = handler ? await handler() : null;

    if (hasPaymentUpdate) {
      updatedOrder = await OrderService.updateOrderPayment(orderId, {
        paymentStatus,
        paymentMethod,
        updatedByStaff,
        restaurantId,
      });
    }

    return updatedOrder;
  },

  updateOrderPayment: async (
    orderId,
    { paymentStatus, paymentMethod, restaurantId = null, updatedByStaff = null }
  ) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (paymentStatus) {
      const normalizedPayment = paymentStatus.toUpperCase();
      order.paymentStatus = normalizedPayment;
      order.statusHistory.push({
        statusType: "PAYMENT",
        status: normalizedPayment,
        timestamp: new Date(),
        updatedByStaff,
      });
    }

    if (paymentMethod) {
      order.paymentMethod = paymentMethod.toUpperCase();
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    const updatedOrder = await OrderService.getOrderById(order._id);
    emitOrderRealtimeEvent("order:updated", updatedOrder);

    return updatedOrder;
  },

  cancelOrder: async (orderId, { cancelledBy = null, restaurantId = null, reason = "" } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(order.orderStatus)) {
      throw new BadRequestError(`Cannot cancel order in status ${order.orderStatus}`);
    }

    order.orderStatus = OrderStatus.CANCELLED;
    if (reason) order.rejectionReason = reason;

    order.statusHistory.push({
      statusType: "ORDER",
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedByStaff: cancelledBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    if (order.orderType === "DINE_IN" && order.table) {
      await checkAndFreeTable(order.table, order.restaurant, order._id);
    }

    const updatedOrder = await OrderService.getOrderById(order._id);
    emitOrderRealtimeEvent("order:updated", updatedOrder);

    return updatedOrder;
  },
  
  rejectOrder: async (orderId, { rejectedBy = null, restaurantId = null, reason = "" } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(order.orderStatus)) {
      throw new BadRequestError(`Cannot reject order in status ${order.orderStatus}`);
    }

    order.orderStatus = OrderStatus.REJECTED;
    order.rejectionReason = reason;
    order.statusHistory.push({
      statusType: "ORDER",
      status: OrderStatus.REJECTED,
      timestamp: new Date(),
      updatedByStaff: rejectedBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    if (order.orderType === "DINE_IN" && order.table) {
      await checkAndFreeTable(order.table, order.restaurant, order._id);
    }

    const updatedOrder = await OrderService.getOrderById(order._id);
    emitOrderRealtimeEvent("order:updated", updatedOrder);

    return updatedOrder;
  },

  updateOrder: async (orderId, updatePayload, { restaurantId = null, updatedByStaff = null } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (updatePayload.specialInstructions !== undefined) {
      order.specialInstructions = String(updatePayload.specialInstructions).trim();
    }

    if (updatePayload.deliveryAddress && order.orderType === "DELIVERY") {
      const normalized = normalizeDeliveryAddress(updatePayload.deliveryAddress);
      if (normalized) order.deliveryAddress = normalized;
    }

    if (updatePayload.customerInfo) {
      order.customerInfo = {
        name: updatePayload.customerInfo.name || order.customerInfo?.name || "",
        phone: updatePayload.customerInfo.phone || order.customerInfo?.phone || "",
        email: updatePayload.customerInfo.email || order.customerInfo?.email || "",
      };
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    const updatedOrder = await OrderService.getOrderById(order._id);
    emitOrderRealtimeEvent("order:updated", updatedOrder);

    return updatedOrder;
  },

  deleteOrder: async (orderId, { restaurantId = null } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const targetRestaurantId = restaurantId || order.restaurant?.toString();
    await Order.deleteOne({ _id: orderId });
    await invalidateOrderCache(order.restaurant);

    if (targetRestaurantId) {
      triggerPusherEvent(
        [`restaurant-${targetRestaurantId}`, `order-${orderId}`],
        "order:deleted",
        { orderId, restaurantId: targetRestaurantId }
      ).catch(() => {});
    }

    return { success: true };
  },
};
