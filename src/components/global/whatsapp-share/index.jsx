"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useNotification from "@/store/hooks/useNotification";
import { Copy, Check, Send, Phone } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function WhatsAppIcon({ className = "w-3.5 h-3.5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-5.518 0-10 4.482-10 10 0 1.762.459 3.418 1.261 4.862l-1.299 4.743 4.857-1.274c1.401.763 2.999 1.169 4.681 1.169 5.518 0 10-4.482 10-10s-4.482-10-10-10zm0 18.2c-1.503 0-2.915-.401-4.14-1.099l-.297-.168-2.879.755.768-2.805-.183-.292c-.767-1.227-1.209-2.668-1.209-4.191 0-4.422 3.598-8.02 8.02-8.02s8.02 3.598 8.02 8.02-3.598 8.02-8.02 8.02z" />
    </svg>
  );
}

export function generateDeliveryWhatsappText(order, restaurant = {}) {
  if (!order) return "";

  const orderNum = order.orderNumber || order._id?.slice(-6) || "N/A";
  const token = order.tokenNumber != null ? ` (Token #${order.tokenNumber})` : "";
  const restaurantName = restaurant?.name || "Restaurant";
  const orderType = (order.orderType || "DELIVERY").replace(/_/g, " ");
  const isDelivery = (order.orderType || "").toUpperCase() === "DELIVERY";

  const customerName = order.customer?.name || order.customerInfo?.name || "Guest Customer";
  const customerPhone = order.customer?.phone || order.customerInfo?.phone || "";

  let addressText = "No address specified";
  let mapLink = "";
  if (order.deliveryAddress) {
    const parts = [
      order.deliveryAddress.street,
      order.deliveryAddress.city,
      order.deliveryAddress.state,
      order.deliveryAddress.zipCode,
    ].filter(Boolean);
    addressText = parts.join(", ");
    if (order.deliveryAddress.label) {
      addressText = `[${order.deliveryAddress.label.toUpperCase()}] ${addressText}`;
    }
    const query = encodeURIComponent(parts.join(", "));
    mapLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  const deliveryNote = order.deliveryAddress?.instructions || "";

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsText = items
    .map((item, idx) => {
      const variant = item.variant?.name ? ` (${item.variant.name})` : "";
      const addons =
        Array.isArray(item.addons) && item.addons.length > 0
          ? ` + [${item.addons.map((a) => a.name).join(", ")}]`
          : "";
      const itemNote = item.specialInstructions ? ` (Note: ${item.specialInstructions})` : "";
      return `${idx + 1}. *${item.quantity}x ${item.name || item.menuItem?.name || "Item"}*${variant}${addons}${itemNote}`;
    })
    .join("\n");

  const isPaid = ["PAID", "COMPLETED"].includes((order.paymentStatus || "").toUpperCase());
  const paymentMethod = (order.paymentMethod || "CASH").toUpperCase();
  const totalAmount = Number(order.totalAmount || 0).toFixed(2);

  const paymentNotice = isPaid
    ? `✅ *PAID ONLINE* (Do NOT collect cash)`
    : `💵 *COLLECT CASH / UPI*: ₹${totalAmount} (${paymentMethod})`;

  const headerTitle = isDelivery ? `🛵 *DELIVERY ORDER DETAILS*` : `🛍️ *ORDER DETAILS*`;

  const lines = [
    headerTitle,
    `🏪 *${restaurantName}*`,
    `--------------------------------`,
    `🏷️ *Order*: #${orderNum}${token}`,
    `📦 *Type*: ${orderType}`,
    ``,
    `👤 *CUSTOMER*`,
    `• *Name*: ${customerName}`,
    customerPhone ? `• *Phone*: ${customerPhone}` : null,
    customerPhone ? `• *Call Link*: tel:${customerPhone}` : null,
    ``,
    isDelivery && order.deliveryAddress ? `📍 *DELIVERY ADDRESS*` : null,
    isDelivery && order.deliveryAddress ? `• ${addressText}` : null,
    isDelivery && deliveryNote ? `• 📝 *Delivery Note*: ${deliveryNote}` : null,
    isDelivery && mapLink ? `• 🗺️ *Map*: ${mapLink}` : null,
    isDelivery && order.deliveryAddress ? `` : null,
    `🛍️ *ITEMS ORDERED* (${items.length} items)`,
    itemsText || "• No items listed",
    order.specialInstructions ? `\n👨‍🍳 *Chef Note*: ${order.specialInstructions}` : null,
    ``,
    `💰 *PAYMENT & BILL*`,
    `• *Total Bill*: ₹${totalAmount}`,
    `• *Status*: ${paymentNotice}`,
    `--------------------------------`,
    `🚀 *Shared via Repeat App*`,
  ].filter((line) => line !== null);

  return lines.join("\n");
}

export function formatWhatsappPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

/**
 * WhatsAppShareButton component
 * Opens WhatsApp with order and delivery details prefilled
 */
export function WhatsAppShareButton(props) {
  if (!props.order) return null;
  const orderKey = props.order?._id || props.order?.orderNumber || "order";
  return <WhatsAppSharePopoverContent key={orderKey} {...props} />;
}

function WhatsAppSharePopoverContent({
  order,
  restaurant = {},
  className = "",
  label = "WhatsApp",
  showIconOnly = false,
  defaultPhone = "",
}) {
  const notification = useNotification();
  const customerPhone = order?.customer?.phone || order?.customerInfo?.phone || "";
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState(defaultPhone || customerPhone || "");

  const messageText = generateDeliveryWhatsappText(order, restaurant);

  const handleSendDirect = (e) => {
    e?.stopPropagation();
    const clean = formatWhatsappPhone(targetPhone);
    if (!clean) {
      notification.error("Please enter a valid phone number");
      return;
    }
    const url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(messageText);
      setCopied(true);
      notification.success("Order details copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={`text-[11px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer select-none ${className}`}
            title="Share order details on WhatsApp"
          >
            <WhatsAppIcon className="w-3 h-3 shrink-0" />
            {!showIconOnly && <span>{label}</span>}
          </button>
        }
      />
      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 p-3 bg-white dark:bg-zinc-900 border border-border shadow-xl rounded-xl z-50 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-foreground block leading-none">Share on WhatsApp</span>
              <span className="text-[10px] text-muted-foreground">Send order & address directly</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy message to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendDirect(e);
          }}
          className="space-y-1.5"
        >
          {customerPhone && targetPhone !== customerPhone && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTargetPhone(customerPhone)}
                className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
              >
                Reset to Customer
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Phone className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Enter phone (e.g. 9876543210)"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="h-8 pl-8 text-xs rounded-lg font-medium"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shrink-0 cursor-pointer"
              title="Send WhatsApp message"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default WhatsAppShareButton;
