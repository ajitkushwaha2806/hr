"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Script from "next/script";
import Button from "@/components/global/button";
import { Check, Loader2, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { PRICING_ADDONS } from "@/constants/pricing";
import { motion } from "framer-motion";
import posthog from "posthog-js";

export default function PricingCard({ plan, index = 0, isCurrentPlan = false, onPaymentSuccess }) {
  const { _id, id, title, description, price, billingCycle, isPopular, badge, features } = plan;
  const planId = _id || id;
  const { isProcessing, handlePayment } = usePayment();

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((item) => item !== addonId)
        : [...prev, addonId]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, item) => {
    const addon = PRICING_ADDONS.find((a) => a._id === item);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const basePrice = plan.totalPrice || price;
  const finalPrice = basePrice + addonsTotal;

  const selectedAddonTitles = selectedAddons
    .map((item) => PRICING_ADDONS.find((a) => a._id === item)?.title)
    .filter(Boolean);

  const displayTitle =
    selectedAddonTitles.length > 0
      ? `${title} + ${selectedAddonTitles.join(" + ")}`
      : title;

  const checkoutProperties = {
    plan_id: planId,
    billing_cycle: billingCycle,
    amount: finalPrice,
    addon_count: selectedAddons.length,
  };

  const safePosthog = (event, props) => {
    if (typeof window !== "undefined" && posthog?.capture) {
      try {
        posthog.capture(event, props);
      } catch (_) {}
    }
  };

  const onPayNow = () => {
    safePosthog("subscription_checkout_started", checkoutProperties);

    handlePayment({
      planId,
      planTitle: displayTitle,
      price: finalPrice,
      selectedAddons,
      onSuccess: (res) => {
        safePosthog("subscription_payment_completed", checkoutProperties);
        if (onPaymentSuccess) {
          onPaymentSuccess({ planTitle: displayTitle, finalPrice, res });
        }
      },
      onError: (err) => {
        safePosthog("subscription_payment_failed", checkoutProperties);
        console.error("Subscription payment error:", err);
      },
      onDismiss: () => {
        safePosthog("subscription_checkout_dismissed", checkoutProperties);
      },
    });
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
        whileHover={{ y: -6 }}
        className={cn(
          "relative flex flex-col h-full p-6 sm:p-7 rounded-2xl transition-all duration-300",
          isPopular
            ? "bg-white dark:bg-zinc-900 border-2 border-primary shadow-xl shadow-primary/10 md:scale-[1.02] z-10"
            : "bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-sm hover:shadow-lg"
        )}
      >
        {badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span
              className={cn(
                "px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1",
                isPopular
                  ? "bg-primary shadow-primary/20"
                  : "bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              )}
            >
              <Sparkles className="w-3 h-3" />
              {badge}
            </span>
          </div>
        )}

        {isCurrentPlan && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Current Plan
            </span>
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-1.5 tracking-tight">
            {title}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed min-h-[38px]">
            {description}
          </p>
        </div>

        <div className="mb-4 flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            ₹{price}
          </span>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            /month
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-6 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {billingCycle}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                ₹{finalPrice}
              </span>
              {plan.originalPrice && addonsTotal === 0 && (
                <span className="text-[11px] line-through text-neutral-400">
                  ₹{plan.originalPrice}
                </span>
              )}
            </div>
          </div>
          {addonsTotal > 0 && (
            <p className="text-[10px] font-semibold text-primary">
              Includes ₹{addonsTotal} for selected add-ons
            </p>
          )}
        </div>

        <div className="flex-1">
          <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3.5">
            What's included:
          </p>
          <ul className="space-y-3">
            {features.slice(0, showAllFeatures ? features.length : 5).map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-0.5 flex-shrink-0",
                    isPopular
                      ? "bg-primary/10 text-primary"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  )}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-[13px] font-medium leading-tight">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {features.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="mt-3.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showAllFeatures ? "Show less" : `View ${features.length - 5} more features`}
            </button>
          )}

          {PRICING_ADDONS && PRICING_ADDONS.length > 0 && (
            <div className="mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-5 mb-6">
              <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                Optional Add-ons
              </p>
              <div className="space-y-3">
                {PRICING_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon._id);
                  return (
                    <label
                      key={addon._id}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group",
                        isChecked
                          ? "bg-primary/5 border-primary/40 dark:bg-primary/10"
                          : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex items-center justify-center w-4 h-4 mt-0.5 rounded border transition-colors flex-shrink-0",
                          isChecked
                            ? "bg-primary border-primary text-white"
                            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 group-hover:border-primary"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon._id)}
                        />
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {addon.title}
                          </span>
                          <span className="text-xs font-bold text-primary whitespace-nowrap">
                            +₹{addon.price}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5 leading-snug">
                          {addon.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            type="button"
            onClick={onPayNow}
            disabled={isProcessing}
            className={cn(
              "w-full py-2.5 px-4 h-11 rounded-md font-bold text-sm tracking-wide text-center transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm group",
              isPopular
                ? "bg-primary text-white hover:bg-[#e0614c] hover:shadow-md hover:shadow-primary/25"
                : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Pay ₹{finalPrice}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
