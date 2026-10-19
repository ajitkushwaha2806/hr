"use client";

import { useState } from "react";
import axios from "axios";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import useNotification from "@/store/hooks/useNotification";
import { useQueryClient } from "@tanstack/react-query";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { restaurantId, restaurants } = useRestaurant();
  const notification = useNotification();
  const queryClient = useQueryClient();

  const currentRestaurant = restaurants?.find((r) => r._id === restaurantId);

  const handlePayment = async ({
    planId,
    planTitle,
    price,
    phone,
    selectedAddons = [],
    onSuccess,
    onError,
    onDismiss,
  }) => {
    if (!restaurantId) {
      notification?.error("Please select a restaurant first.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 2. Create order on server using live credentials
      const { data: orderData } = await axios.post("/api/subscription/create-order", {
        restaurantId,
        planId,
        selectedAddonIds: selectedAddons,
        phone,
      });

      if (!orderData?.success || !orderData?.data?.orderId) {
        throw new Error(orderData?.message || "Failed to initialize order");
      }

      const {
        orderId,
        amount,
        currency,
        keyId,
        restaurantName,
        restaurantPhone,
      } = orderData.data;

      const effectiveKey =
        keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 3. Configure Razorpay modal
      const options = {
        key: effectiveKey,
        amount,
        currency: currency || "INR",
        name: "getrepeat",
        description: `${planTitle} Subscription`,
        order_id: orderId,
        prefill: {
          name: restaurantName || currentRestaurant?.name || "",
          contact: phone || restaurantPhone || currentRestaurant?.phone || "",
          email: currentRestaurant?.email || "",
        },
        theme: {
          color: "#ff5722",
        },
        handler: async (response) => {
          try {
            // 4. Verify payment on server
            const { data: verifyData } = await axios.post("/api/subscription/verify", {
              restaurantId,
              planId,
              selectedAddonIds: selectedAddons,
              phone,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyData?.success) {
              throw new Error(verifyData?.message || "Payment verification failed");
            }

            // Invalidate restaurant query caches so the banner & status immediately refresh
            queryClient.invalidateQueries({ queryKey: ["restaurant-details", restaurantId] });
            queryClient.invalidateQueries({ queryKey: ["all-restaurants"] });

            notification?.success(
              verifyData?.message || "Subscription activated successfully!"
            );

            if (onSuccess) {
              onSuccess({
                ...response,
                subscription: verifyData?.data?.subscription,
              });
            }
          } catch (verifyError) {
            console.error("[Payment Verification Error]:", verifyError);
            const errMsg =
              verifyError?.response?.data?.message ||
              verifyError?.message ||
              "Failed to verify payment.";
            notification?.error(errMsg);
            if (onError) onError(verifyError);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            if (onDismiss) onDismiss();
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (failedRes) => {
        setIsProcessing(false);
        const failMsg = failedRes?.error?.description || "Payment failed. Please try again.";
        notification?.error(failMsg);
        if (onError) onError(failedRes);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("[Handle Payment Error]:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not proceed with payment.";
      notification?.error(errMsg);
      if (onError) onError(err);
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handlePayment,
  };
}
