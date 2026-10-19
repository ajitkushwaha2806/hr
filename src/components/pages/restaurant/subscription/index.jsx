"use client";

import React, { useState } from "react";
import { PRICING_PLANS } from "@/constants/pricing";
import PricingCard from "./fragments/PricingCard";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/global/button";

export default function SubscriptionPage({ restaurantData }) {
  const { restaurantId, restaurants } = useRestaurant();
  const currentRestaurant =
    restaurantData || restaurants?.find((r) => r._id === restaurantId);

  const [celebration, setCelebration] = useState(null);

  const handlePaymentSuccess = ({ planTitle, finalPrice, res }) => {
    setCelebration({
      planTitle,
      finalPrice,
      orderId: res?.razorpay_order_id,
      paymentId: res?.razorpay_payment_id,
    });
  };

  const currentPlanId = currentRestaurant?.subscription?.plan;

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-6 px-1 sm:px-4">

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-8">
        {PRICING_PLANS.map((plan, index) => {
          const isCurrentPlan = currentPlanId === plan._id;
          return (
            <PricingCard
              key={plan._id}
              plan={plan}
              index={index}
              isCurrentPlan={isCurrentPlan}
              onPaymentSuccess={handlePaymentSuccess}
            />
          );
        })}
      </div>

      {/* Celebration Modal after successful payment */}

      {/* Celebration Modal after successful payment */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative border border-neutral-200 dark:border-zinc-800 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setCelebration(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-10" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Payment Successful
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1 mb-2">
                Subscription Activated!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                Thank you for subscribing to <strong>{celebration.planTitle}</strong>. Your online ordering and premium features are fully active.
              </p>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-100 dark:border-zinc-800 text-xs mb-6 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount Paid:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ₹{celebration.finalPrice}
                  </span>
                </div>
                {celebration.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Payment ID:</span>
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      {celebration.paymentId}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setCelebration(null)}
                className="w-full py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-[#e0614c] cursor-pointer"
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
