"use client";
import SubscriptionPage from "@/components/pages/restaurant/subscription";

export default function RestaurantPricingPage() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 sm:m-4 p-3 sm:p-5 md:p-6 space-y-5 sm:space-y-6 sm:rounded-xl sm:border border-border/40 sm:shadow-xs min-w-0 min-h-screen sm:min-h-0 pb-10">
      <SubscriptionPage />
    </div>
  );
}
