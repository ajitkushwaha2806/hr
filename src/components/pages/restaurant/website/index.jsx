"use client";
import { useFormik } from "formik";
import { useSyncExternalStore } from "react";
import { Save, Loader2 } from "lucide-react";
import Loader from "@/components/global/loader";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import ThemeSection from "./fragments/ThemeSection";
import BannerSection from "./fragments/BannerSection";
import OrderingSection from "./fragments/OrderingSection";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import SocialLinksSection from "./fragments/SocialLinksSection";
import { integrationService } from "@/services/frontend/integration";
import { WebsiteConfigService } from "@/services/frontend/website-config";

const emptySubscribe = () => () => {};

const WebsiteConfigPage = () => {
  const { restaurantId, restaurants } = useRestaurant();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const { data, isLoading } = useQuery({
    queryKey: ["website-config", restaurantId],
    queryFn: () => WebsiteConfigService.getWebsiteConfig(restaurantId),
    enabled: !!restaurantId,
  });

  const { data: integrationsData } = useQuery({
    queryKey: ["integrations", restaurantId],
    queryFn: () => integrationService.getIntegrations(restaurantId),
    enabled: !!restaurantId,
  });

  const activeRestaurant = restaurants?.find(r => r._id === restaurantId);
  const configData = data?.data || data;
  const isRazorpayConnected = integrationsData?.razorpay?.isLinked || false;

  const { mutate, isPending } = useFormMutation({
    mutationFn: (payload) => WebsiteConfigService.updateWebsiteConfig(restaurantId, payload),
    queryKey: ["website-config", restaurantId],
    invalidateKeys: [["website-config", restaurantId]],
    extractUpdatedData: (response) => response?.data || response,
    successMessage: "Website configuration saved successfully!"
  });

  const formik = useFormik({
    initialValues: {
      homepage: {
        banners: {
          isEnabled: configData?.homepage?.banners?.isEnabled ?? true,
          items: configData?.homepage?.banners?.items || [],
        },
      },
      theme: {
        colors: {
          primary: configData?.theme?.colors?.primary || "#000000",
          primaryForeground: configData?.theme?.colors?.primaryForeground || "#ffffff",
          secondary: configData?.theme?.colors?.secondary || "#f4f4f5",
          secondaryForeground: configData?.theme?.colors?.secondaryForeground || "#18181b",
          background: configData?.theme?.colors?.background || "#ffffff",
          foreground: configData?.theme?.colors?.foreground || "#09090b",
          muted: configData?.theme?.colors?.muted || "#f4f4f5",
          mutedForeground: configData?.theme?.colors?.mutedForeground || "#71717a",
        }
      },
      socialLinks: {
        facebook: configData?.socialLinks?.facebook || "",
        instagram: configData?.socialLinks?.instagram || "",
        twitter: configData?.socialLinks?.twitter || "",
      },
      ordering: {
        acceptedTypes: Array.isArray(configData?.ordering?.acceptedTypes)
          ? configData.ordering.acceptedTypes
          : ["DINE_IN", "TAKEAWAY", "DELIVERY"],
        defaultType: (configData?.ordering?.defaultType && configData?.ordering?.acceptedTypes?.includes(configData.ordering.defaultType))
          ? configData.ordering.defaultType
          : (Array.isArray(configData?.ordering?.acceptedTypes) && configData.ordering.acceptedTypes.length > 0 ? configData.ordering.acceptedTypes[0] : null),
        paymentMethods: configData?.ordering?.paymentMethods || ["CASH"],
        defaultPaymentMethod: configData?.ordering?.defaultPaymentMethod || "CASH",
        upiId: configData?.ordering?.upiId || configData?.ordering?.paymentSettings?.upi?.upiId || activeRestaurant?.upiId || "",
        razorpayEnabled: configData?.ordering?.razorpayEnabled ?? (configData?.ordering?.paymentSettings?.razorpay?.isEnabled ?? isRazorpayConnected),
        paymentSettings: {
          upi: {
            isEnabled: configData?.ordering?.paymentSettings?.upi?.isEnabled ?? Boolean(configData?.ordering?.upiId || activeRestaurant?.upiId),
            upiId: configData?.ordering?.paymentSettings?.upi?.upiId || configData?.ordering?.upiId || activeRestaurant?.upiId || "",
          },
          razorpay: {
            isEnabled: configData?.ordering?.paymentSettings?.razorpay?.isEnabled ?? (configData?.ordering?.razorpayEnabled ?? isRazorpayConnected),
          },
          activeProvider: configData?.ordering?.paymentSettings?.activeProvider || (isRazorpayConnected ? "RAZORPAY" : "UPI"),
        },
        minOrderValue: {
          isEnabled: configData?.ordering?.minOrderValue?.isEnabled ?? Boolean(
            configData?.ordering?.dineIn?.minOrderValue?.isEnabled ||
            configData?.ordering?.takeaway?.minOrderValue?.isEnabled ||
            configData?.ordering?.delivery?.minOrderValue?.isEnabled
          ),
          amount: configData?.ordering?.minOrderValue?.amount ?? 0,
          dineIn: {
            isEnabled: configData?.ordering?.dineIn?.minOrderValue?.isEnabled ?? configData?.ordering?.minOrderValue?.dineIn?.isEnabled ?? configData?.ordering?.minOrderValue?.orderTypes?.DINE_IN?.isEnabled ?? false,
            amount: configData?.ordering?.dineIn?.minOrderValue?.amount ?? configData?.ordering?.minOrderValue?.dineIn?.amount ?? configData?.ordering?.minOrderValue?.orderTypes?.DINE_IN?.amount ?? 0,
          },
          takeaway: {
            isEnabled: configData?.ordering?.takeaway?.minOrderValue?.isEnabled ?? configData?.ordering?.minOrderValue?.takeaway?.isEnabled ?? configData?.ordering?.minOrderValue?.orderTypes?.TAKEAWAY?.isEnabled ?? false,
            amount: configData?.ordering?.takeaway?.minOrderValue?.amount ?? configData?.ordering?.minOrderValue?.takeaway?.amount ?? configData?.ordering?.minOrderValue?.orderTypes?.TAKEAWAY?.amount ?? 0,
          },
          delivery: {
            isEnabled: configData?.ordering?.delivery?.minOrderValue?.isEnabled ?? configData?.ordering?.minOrderValue?.delivery?.isEnabled ?? configData?.ordering?.minOrderValue?.orderTypes?.DELIVERY?.isEnabled ?? false,
            amount: configData?.ordering?.delivery?.minOrderValue?.amount ?? configData?.ordering?.minOrderValue?.delivery?.amount ?? configData?.ordering?.minOrderValue?.orderTypes?.DELIVERY?.amount ?? 0,
          },
        },
        deliveryCharge: {
          isEnabled: configData?.ordering?.delivery?.deliveryCharge?.isEnabled ?? configData?.ordering?.deliveryCharge?.isEnabled ?? false,
          amount: configData?.ordering?.delivery?.deliveryCharge?.amount ?? configData?.ordering?.deliveryCharge?.amount ?? 0,
          freeDeliveryAbove: configData?.ordering?.delivery?.deliveryCharge?.freeDeliveryAbove ?? configData?.ordering?.deliveryCharge?.freeDeliveryAbove ?? 0,
        },
        packingCharges: {
          isEnabled: configData?.ordering?.packingCharges?.isEnabled ?? Boolean(
            configData?.ordering?.delivery?.packingCharge?.isEnabled ||
            configData?.ordering?.takeaway?.packingCharge?.isEnabled ||
            configData?.ordering?.dineIn?.packingCharge?.isEnabled
          ),
          amount: configData?.ordering?.packingCharges?.amount ?? 0,
          delivery: {
            isEnabled: configData?.ordering?.delivery?.packingCharge?.isEnabled ?? configData?.ordering?.packingCharges?.delivery?.isEnabled ?? configData?.ordering?.packingCharges?.orderTypes?.DELIVERY?.isEnabled ?? false,
            amount: configData?.ordering?.delivery?.packingCharge?.amount ?? configData?.ordering?.packingCharges?.delivery?.amount ?? configData?.ordering?.packingCharges?.orderTypes?.DELIVERY?.amount ?? 0,
          },
          takeaway: {
            isEnabled: configData?.ordering?.takeaway?.packingCharge?.isEnabled ?? configData?.ordering?.packingCharges?.takeaway?.isEnabled ?? configData?.ordering?.packingCharges?.orderTypes?.TAKEAWAY?.isEnabled ?? false,
            amount: configData?.ordering?.takeaway?.packingCharge?.amount ?? configData?.ordering?.packingCharges?.takeaway?.amount ?? configData?.ordering?.packingCharges?.orderTypes?.TAKEAWAY?.amount ?? 0,
          },
          dineIn: {
            isEnabled: configData?.ordering?.dineIn?.packingCharge?.isEnabled ?? configData?.ordering?.packingCharges?.dineIn?.isEnabled ?? configData?.ordering?.packingCharges?.orderTypes?.DINE_IN?.isEnabled ?? false,
            amount: configData?.ordering?.dineIn?.packingCharge?.amount ?? configData?.ordering?.packingCharges?.dineIn?.amount ?? configData?.ordering?.packingCharges?.orderTypes?.DINE_IN?.amount ?? 0,
          },
        },
        platformFee: {
          isEnabled: configData?.ordering?.platformFee?.isEnabled ?? Boolean(
            configData?.ordering?.delivery?.platformFee?.isEnabled ||
            configData?.ordering?.takeaway?.platformFee?.isEnabled ||
            configData?.ordering?.dineIn?.platformFee?.isEnabled
          ),
          amount: configData?.ordering?.platformFee?.amount ?? 0,
          delivery: {
            isEnabled: configData?.ordering?.delivery?.platformFee?.isEnabled ?? configData?.ordering?.platformFee?.delivery?.isEnabled ?? configData?.ordering?.platformFee?.orderTypes?.DELIVERY?.isEnabled ?? false,
            amount: configData?.ordering?.delivery?.platformFee?.amount ?? configData?.ordering?.platformFee?.delivery?.amount ?? configData?.ordering?.platformFee?.orderTypes?.DELIVERY?.amount ?? 0,
          },
          takeaway: {
            isEnabled: configData?.ordering?.takeaway?.platformFee?.isEnabled ?? configData?.ordering?.platformFee?.takeaway?.isEnabled ?? configData?.ordering?.platformFee?.orderTypes?.TAKEAWAY?.isEnabled ?? false,
            amount: configData?.ordering?.takeaway?.platformFee?.amount ?? configData?.ordering?.platformFee?.takeaway?.amount ?? configData?.ordering?.platformFee?.orderTypes?.TAKEAWAY?.amount ?? 0,
          },
          dineIn: {
            isEnabled: configData?.ordering?.dineIn?.platformFee?.isEnabled ?? configData?.ordering?.platformFee?.dineIn?.isEnabled ?? configData?.ordering?.platformFee?.orderTypes?.DINE_IN?.isEnabled ?? false,
            amount: configData?.ordering?.dineIn?.platformFee?.amount ?? configData?.ordering?.platformFee?.dineIn?.amount ?? configData?.ordering?.platformFee?.orderTypes?.DINE_IN?.amount ?? 0,
          },
        },
        taxAndServiceFee: {
          isEnabled: configData?.ordering?.taxAndServiceFee?.isEnabled ?? Boolean(
            configData?.ordering?.delivery?.taxAndServiceFee?.isEnabled ||
            configData?.ordering?.takeaway?.taxAndServiceFee?.isEnabled ||
            configData?.ordering?.dineIn?.taxAndServiceFee?.isEnabled
          ),
          amount: configData?.ordering?.taxAndServiceFee?.amount ?? 0,
          delivery: {
            isEnabled: configData?.ordering?.delivery?.taxAndServiceFee?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.delivery?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.DELIVERY?.isEnabled ?? false,
            amount: configData?.ordering?.delivery?.taxAndServiceFee?.amount ?? configData?.ordering?.taxAndServiceFee?.delivery?.amount ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.DELIVERY?.amount ?? 0,
          },
          takeaway: {
            isEnabled: configData?.ordering?.takeaway?.taxAndServiceFee?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.takeaway?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.TAKEAWAY?.isEnabled ?? false,
            amount: configData?.ordering?.takeaway?.taxAndServiceFee?.amount ?? configData?.ordering?.taxAndServiceFee?.takeaway?.amount ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.TAKEAWAY?.amount ?? 0,
          },
          dineIn: {
            isEnabled: configData?.ordering?.dineIn?.taxAndServiceFee?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.dineIn?.isEnabled ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.DINE_IN?.isEnabled ?? false,
            amount: configData?.ordering?.dineIn?.taxAndServiceFee?.amount ?? configData?.ordering?.taxAndServiceFee?.dineIn?.amount ?? configData?.ordering?.taxAndServiceFee?.orderTypes?.DINE_IN?.amount ?? 0,
          },
        }
      },
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (!restaurantId) return;

      const rawUpiId = (values.ordering?.paymentSettings?.upi?.upiId ?? values.ordering?.upiId ?? "").trim();
      const isUpiEnabled = Boolean(values.ordering?.paymentSettings?.upi?.isEnabled);
      const isRazorpayEnabled = Boolean(values.ordering?.paymentSettings?.razorpay?.isEnabled);
      const activeProvider = values.ordering?.paymentSettings?.activeProvider || (isRazorpayEnabled ? "RAZORPAY" : "UPI");

      const acceptedTypes = values.ordering?.acceptedTypes || [];
      const defaultType = (values.ordering?.defaultType && acceptedTypes.includes(values.ordering.defaultType))
        ? values.ordering.defaultType
        : (acceptedTypes.length > 0 ? acceptedTypes[0] : null);

      const isDineInAccepted = acceptedTypes.includes("DINE_IN");
      const isTakeawayAccepted = acceptedTypes.includes("TAKEAWAY");
      const isDeliveryAccepted = acceptedTypes.includes("DELIVERY");

      const computeChargeConfig = (rawCharge) => {
        const isDelivery = Boolean(rawCharge?.delivery?.isEnabled);
        const isTakeaway = Boolean(rawCharge?.takeaway?.isEnabled);
        const isDineIn = Boolean(rawCharge?.dineIn?.isEnabled);
        const isAnyActive = (isDeliveryAccepted && isDelivery) || (isTakeawayAccepted && isTakeaway) || (isDineInAccepted && isDineIn);

        const deliveryAmount = Number(rawCharge?.delivery?.amount || 0);
        const takeawayAmount = Number(rawCharge?.takeaway?.amount || 0);
        const dineInAmount = Number(rawCharge?.dineIn?.amount || 0);

        return {
          isEnabled: isAnyActive,
          amount: deliveryAmount || takeawayAmount || dineInAmount || Number(rawCharge?.amount || 0),
          delivery: {
            isEnabled: isDelivery,
            amount: deliveryAmount,
          },
          takeaway: {
            isEnabled: isTakeaway,
            amount: takeawayAmount,
          },
          dineIn: {
            isEnabled: isDineIn,
            amount: dineInAmount,
          },
          orderTypes: {
            DELIVERY: {
              isEnabled: isDelivery,
              amount: deliveryAmount,
            },
            TAKEAWAY: {
              isEnabled: isTakeaway,
              amount: takeawayAmount,
            },
            DINE_IN: {
              isEnabled: isDineIn,
              amount: dineInAmount,
            },
          },
          applicableOrderTypes: [
            isDelivery && "DELIVERY",
            isTakeaway && "TAKEAWAY",
            isDineIn && "DINE_IN",
          ].filter(Boolean),
        };
      };

      const computedPackingCharges = computeChargeConfig(values.ordering?.packingCharges);
      const computedPlatformFee = computeChargeConfig(values.ordering?.platformFee);
      const computedTaxAndServiceFee = computeChargeConfig(values.ordering?.taxAndServiceFee);

      const computedDeliveryCharge = {
        isEnabled: Boolean(values.ordering?.deliveryCharge?.isEnabled),
        amount: Number(values.ordering?.deliveryCharge?.amount || 0),
        freeDeliveryAbove: Number(values.ordering?.deliveryCharge?.freeDeliveryAbove || 0),
      };

      const isDineInMov = Boolean(values.ordering?.minOrderValue?.dineIn?.isEnabled);
      const isTakeawayMov = Boolean(values.ordering?.minOrderValue?.takeaway?.isEnabled);
      const isDeliveryMov = Boolean(values.ordering?.minOrderValue?.delivery?.isEnabled);

      const dineInMovAmount = Number(values.ordering?.minOrderValue?.dineIn?.amount || 0);
      const takeawayMovAmount = Number(values.ordering?.minOrderValue?.takeaway?.amount || 0);
      const deliveryMovAmount = Number(values.ordering?.minOrderValue?.delivery?.amount || 0);

      const computedMinOrderValue = {
        isEnabled: (isDineInAccepted && isDineInMov) || (isTakeawayAccepted && isTakeawayMov) || (isDeliveryAccepted && isDeliveryMov),
        amount: dineInMovAmount || takeawayMovAmount || deliveryMovAmount || 0,
        dineIn: {
          isEnabled: isDineInMov,
          amount: dineInMovAmount,
        },
        takeaway: {
          isEnabled: isTakeawayMov,
          amount: takeawayMovAmount,
        },
        delivery: {
          isEnabled: isDeliveryMov,
          amount: deliveryMovAmount,
        },
        orderTypes: {
          DINE_IN: {
            isEnabled: isDineInMov,
            amount: dineInMovAmount,
          },
          TAKEAWAY: {
            isEnabled: isTakeawayMov,
            amount: takeawayMovAmount,
          },
          DELIVERY: {
            isEnabled: isDeliveryMov,
            amount: deliveryMovAmount,
          },
        },
      };

      const payload = {
        homepage: {
          ...configData?.homepage,
          banners: {
            isEnabled: values.homepage.banners.isEnabled,
            items: values.homepage.banners.items.map(b => ({
               ...b,
               image: b.image?._id || b.image,
            }))
          }
        },
        theme: values.theme,
        socialLinks: values.socialLinks,
        ordering: {
          ...values.ordering,
          acceptedTypes,
          defaultType,
          upiId: rawUpiId,
          razorpayEnabled: isRazorpayEnabled && (activeProvider !== "UPI"),
          paymentSettings: {
            upi: {
              isEnabled: isUpiEnabled,
              upiId: rawUpiId,
            },
            razorpay: {
              isEnabled: isRazorpayEnabled,
            },
            activeProvider: activeProvider,
          },
          packingCharges: computedPackingCharges,
          platformFee: computedPlatformFee,
          taxAndServiceFee: computedTaxAndServiceFee,
          deliveryCharge: computedDeliveryCharge,
          minOrderValue: computedMinOrderValue,
        },
      };

      mutate(payload, {
        onSuccess: () => resetForm({ values }),
      });
    },
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex-1 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="p-2 md:p-4 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md py-3 -mx-2 px-2 md:mx-0 md:px-0 md:py-0 border-b border-border/30 md:border-0">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Website Configuration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your storefront banners, payment integrations, and ordering options.</p>
          </div>
          
          <Button 
            onClick={formik.handleSubmit}
            disabled={isPending || !formik.dirty} 
            className="w-full md:w-auto h-11 px-8 rounded-md font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border-0 md:border border-border/40 shadow-none md:shadow-sm p-1 md:p-8 space-y-10 md:space-y-12">
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <BannerSection formik={formik} />  
              <ThemeSection formik={formik} />
              <OrderingSection formik={formik} isRazorpayConnected={isRazorpayConnected} restaurantId={restaurantId} activeRestaurant={activeRestaurant} />
              <SocialLinksSection formik={formik} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteConfigPage;
