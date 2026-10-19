"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { PRICING_FAQ } from "@/constants/pricing";
import { cn } from "@/lib/utils";

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-14 max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          Got Questions?
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Everything you need to know about plans, billing, and renewals.
        </p>
      </div>

      <div className="space-y-3">
        {PRICING_FAQ.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-neutral-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-neutral-50/50 dark:hover:bg-zinc-800/40 cursor-pointer"
              >
                <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0",
                    isOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-zinc-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
