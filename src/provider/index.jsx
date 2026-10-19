"use client";
import { useState } from "react";
import { store } from "@/store";
import { Provider } from "react-redux";
import { AppClerkProvider } from "./clerk";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAndroidBridge } from "@/hooks/useAndroidBridge";
import OfflineBanner from "@/components/global/offline-banner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationBanner from "@/components/global/notification-banner";
import { NewOrderAlertModal } from "@/components/global/new-order-modal";

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  useAndroidBridge();

  return (
    <Provider store={store}>
      <AppClerkProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <OfflineBanner />
            <NotificationBanner />
            {children}
            <NewOrderAlertModal />
          </TooltipProvider>
        </QueryClientProvider>
      </AppClerkProvider>
    </Provider>
  );
}
