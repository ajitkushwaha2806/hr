"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import useNotification from "@/store/hooks/useNotification";
import { PaymentService } from "@/services/frontend/payments";
import { 
  Utensils, 
  ShoppingBag, 
  Truck, 
  Banknote, 
  CreditCard, 
  Link as LinkIcon, 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  IndianRupee
} from "lucide-react";

const OrderingSection = ({ formik, isRazorpayConnected, restaurantId, activeRestaurant }) => {
  const router = useRouter();
  const notification = useNotification();
  const acceptedTypes = formik.values.ordering?.acceptedTypes || [];
  const paymentMethods = formik.values.ordering?.paymentMethods || [];

  const upiSettings = formik.values.ordering?.paymentSettings?.upi || {};
  const razorpaySettings = formik.values.ordering?.paymentSettings?.razorpay || {};

  const isUpiEnabled = Boolean(upiSettings.isEnabled);
  const upiId = (formik.values.ordering?.paymentSettings?.upi?.upiId ?? formik.values.ordering?.upiId ?? activeRestaurant?.upiId ?? "").trim();
  const isRazorpayEnabled = Boolean(razorpaySettings.isEnabled);

  const hasExistingUpi = Boolean(activeRestaurant?.upiId?.trim() || upiId);
  const hasAnyOnlineIntegration = (isUpiEnabled && Boolean(upiId)) || (isRazorpayEnabled && isRazorpayConnected);

  const handleOrderTypeChange = (type, checked) => {
    let newTypes = [...acceptedTypes];
    if (checked) {
      if (!newTypes.includes(type)) newTypes.push(type);
      if (newTypes.length === 1 && !formik.values.ordering?.defaultType) {
        formik.setFieldValue("ordering.defaultType", type);
      }
    } else {
      newTypes = newTypes.filter((t) => t !== type);
      if (formik.values.ordering?.defaultType === type) {
        formik.setFieldValue("ordering.defaultType", newTypes.length > 0 ? newTypes[0] : null);
      }
    }
    formik.setFieldValue("ordering.acceptedTypes", newTypes);
  };

  const handlePaymentMethodChange = (method, checked) => {
    let newMethods = [...paymentMethods];
    if (checked) {
      if (!newMethods.includes(method)) newMethods.push(method);
      if (newMethods.length === 1 && !formik.values.ordering?.defaultPaymentMethod) {
        formik.setFieldValue("ordering.defaultPaymentMethod", method);
      }

      // If enabling ONLINE, ensure only ONE provider is enabled
      if (method === "ONLINE") {
        if (!isUpiEnabled && !isRazorpayEnabled) {
          if (isRazorpayConnected) {
            formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", true);
            formik.setFieldValue("ordering.razorpayEnabled", true);
            formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", false);
            formik.setFieldValue("ordering.paymentSettings.activeProvider", "RAZORPAY");
          } else {
            formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", true);
            formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", false);
            formik.setFieldValue("ordering.razorpayEnabled", false);
            formik.setFieldValue("ordering.paymentSettings.activeProvider", "UPI");
          }
        }
      }
    } else {
      newMethods = newMethods.filter((m) => m !== method);
      if (formik.values.ordering?.defaultPaymentMethod === method) {
        formik.setFieldValue("ordering.defaultPaymentMethod", newMethods.length > 0 ? newMethods[0] : null);
      }

      // If disabling ONLINE, disable both providers
      if (method === "ONLINE") {
        formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", false);
        formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", false);
        formik.setFieldValue("ordering.razorpayEnabled", false);
      }
    }
    formik.setFieldValue("ordering.paymentMethods", newMethods);
  };
  
  const handleToggleUpi = (checked) => {
    if (checked) {
      formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", true);
      formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", false);
      formik.setFieldValue("ordering.razorpayEnabled", false);
      formik.setFieldValue("ordering.paymentSettings.activeProvider", "UPI");

      if (!paymentMethods.includes("ONLINE")) {
        formik.setFieldValue("ordering.paymentMethods", [...paymentMethods, "ONLINE"]);
      }
      notification.info("Direct UPI activated as active online payment method.");
    } else {
      formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", false);
      formik.setFieldValue("ordering.paymentMethods", paymentMethods.filter(m => m !== "ONLINE"));
      if (formik.values.ordering?.defaultPaymentMethod === "ONLINE") {
        formik.setFieldValue("ordering.defaultPaymentMethod", "CASH");
      }
    }
  };

  // Switch to Razorpay (mutually exclusive)
  const handleToggleRazorpay = (checked) => {
    if (checked && !isRazorpayConnected) {
      handleConnectRazorpay();
      return;
    }

    if (checked) {
      formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", true);
      formik.setFieldValue("ordering.razorpayEnabled", true);
      formik.setFieldValue("ordering.paymentSettings.upi.isEnabled", false);
      formik.setFieldValue("ordering.paymentSettings.activeProvider", "RAZORPAY");

      if (!paymentMethods.includes("ONLINE")) {
        formik.setFieldValue("ordering.paymentMethods", [...paymentMethods, "ONLINE"]);
      }
      notification.info("Razorpay activated as active online payment method.");
    } else {
      formik.setFieldValue("ordering.paymentSettings.razorpay.isEnabled", false);
      formik.setFieldValue("ordering.razorpayEnabled", false);
      formik.setFieldValue("ordering.paymentMethods", paymentMethods.filter(m => m !== "ONLINE"));
      if (formik.values.ordering?.defaultPaymentMethod === "ONLINE") {
        formik.setFieldValue("ordering.defaultPaymentMethod", "CASH");
      }
    }
  };

  const handleUpiIdChange = (e) => {
    const val = e.target.value.trim();
    formik.setFieldValue("ordering.paymentSettings.upi.upiId", val);
    formik.setFieldValue("ordering.upiId", val);
  };

  const handleConnectRazorpay = async () => {
    try {
      notification.info("Connecting to Razorpay...");
      const res = await PaymentService.getRazorpayConnectUrl(restaurantId);
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      notification.error("Failed to initiate Razorpay connection");
    }
  };

  const orderTypeOptions = [
    { id: "DINE_IN", label: "Dine-In", icon: Utensils, description: "Allow customers to order from their tables." },
    { id: "TAKEAWAY", label: "Takeaway", icon: ShoppingBag, description: "Allow customers to order for pickup." },
    { id: "DELIVERY", label: "Delivery", icon: Truck, description: "Allow customers to request delivery." },
  ];

  const isValidUpi = upiId.includes("@") && upiId.length >= 4;

  const getOnlineStatusSubtitle = () => {
    if (isUpiEnabled && Boolean(upiId)) {
      return `Active: Direct UPI (${upiId})`;
    }
    if (isRazorpayEnabled && isRazorpayConnected) {
      return "Active: Razorpay Gateway";
    }
    return "Accept digital payments securely (Enable UPI or Razorpay below)";
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Ordering Configuration</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage accepted order types, checkout payment methods, and online payment integrations.</p>
      </div>

      <div className="space-y-8 pt-1">
        {/* Order Types */}
        <div className="space-y-4">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Accepted Order Types</h4>
          <div className="space-y-4">
            {orderTypeOptions.map((option) => {
              const Icon = option.icon;
              const isAccepted = acceptedTypes.includes(option.id);
              const isDefault = formik.values.ordering?.defaultType === option.id;
              const isDeliveryOption = option.id === "DELIVERY";
              const movKey = option.id === "DINE_IN" ? "dineIn" : option.id === "TAKEAWAY" ? "takeaway" : "delivery";
              const isMovEnabled = Boolean(formik.values.ordering?.minOrderValue?.[movKey]?.isEnabled);
              const movAmount = formik.values.ordering?.minOrderValue?.[movKey]?.amount;

              const isPackingEnabled = Boolean(formik.values.ordering?.packingCharges?.[movKey]?.isEnabled);
              const packingAmount = formik.values.ordering?.packingCharges?.[movKey]?.amount;

              const isPlatformFeeEnabled = Boolean(formik.values.ordering?.platformFee?.[movKey]?.isEnabled);
              const platformFeeAmount = formik.values.ordering?.platformFee?.[movKey]?.amount;

              const isTaxServiceEnabled = Boolean(formik.values.ordering?.taxAndServiceFee?.[movKey]?.isEnabled);
              const taxServiceAmount = formik.values.ordering?.taxAndServiceFee?.[movKey]?.amount;

              return (
                <div 
                  key={option.id} 
                  className={`flex flex-col p-4 rounded-xl border ${isDefault ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border/50 bg-white dark:bg-zinc-900/30'} transition-all hover:border-border`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{option.label}</p>
                          {isDefault && <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary rounded-full">Default</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isAccepted && !isDefault && (
                        <button
                          type="button"
                          onClick={() => formik.setFieldValue("ordering.defaultType", option.id)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-border/50 bg-white dark:bg-zinc-800 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                      <Switch
                        checked={isAccepted}
                        onCheckedChange={(checked) => handleOrderTypeChange(option.id, checked)}
                      />
                    </div>
                  </div>

                  {/* Sub-settings when this order type is accepted */}
                  {isAccepted && (
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Minimum Order Value */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-zinc-800/40 border border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <IndianRupee className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Minimum Order Value</p>
                              <p className="text-[11px] text-muted-foreground">Do not allow orders below minimum amount</p>
                            </div>
                          </div>
                          <Switch
                            checked={isMovEnabled}
                            onCheckedChange={(checked) => formik.setFieldValue(`ordering.minOrderValue.${movKey}.isEnabled`, checked)}
                          />
                        </div>

                        {isMovEnabled && (
                          <div className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Minimum Order (₹) <span className="text-rose-500">*</span>
                              </label>
                              <p className="text-[10px] text-muted-foreground">
                                {Number(movAmount) > 0 
                                  ? `Orders below ₹${movAmount} cannot be placed for ${option.label.toLowerCase()}`
                                  : `Set minimum order amount required for ${option.label.toLowerCase()}`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={movAmount === 0 ? '' : (movAmount ?? '')}
                                onChange={(e) => formik.setFieldValue(`ordering.minOrderValue.${movKey}.amount`, e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                                className="w-16 text-xs bg-transparent outline-none font-medium text-foreground text-right"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delivery Charges configuration only on Delivery */}
                      {isDeliveryOption && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-zinc-800/40 border border-border/40">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Truck className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">Delivery Charges</p>
                                <p className="text-[11px] text-muted-foreground">Charge customers for delivery orders</p>
                              </div>
                            </div>
                            <Switch
                              checked={formik.values.ordering?.deliveryCharge?.isEnabled || false}
                              onCheckedChange={(checked) => formik.setFieldValue("ordering.deliveryCharge.isEnabled", checked)}
                            />
                          </div>

                          {formik.values.ordering?.deliveryCharge?.isEnabled && (
                            <div className="p-2.5 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 space-y-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* Standard Delivery Fee */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Delivery Fee <span className="text-rose-500">*</span>
                                  </label>
                                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all">
                                    <span className="text-xs font-medium text-muted-foreground">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={formik.values.ordering?.deliveryCharge?.amount === 0 ? '' : (formik.values.ordering?.deliveryCharge?.amount ?? '')}
                                      onChange={(e) => formik.setFieldValue("ordering.deliveryCharge.amount", e.target.value === '' ? 0 : Number(e.target.value))}
                                      placeholder="0"
                                      className="w-full text-xs bg-transparent outline-none font-medium text-foreground text-right"
                                    />
                                  </div>
                                </div>

                                {/* Free Delivery Threshold */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                      Free Delivery Above
                                    </label>
                                    <span className="text-[10px] text-muted-foreground">(Optional)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all">
                                    <span className="text-xs font-medium text-muted-foreground">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={formik.values.ordering?.deliveryCharge?.freeDeliveryAbove === 0 ? '' : (formik.values.ordering?.deliveryCharge?.freeDeliveryAbove ?? '')}
                                      onChange={(e) => formik.setFieldValue("ordering.deliveryCharge.freeDeliveryAbove", e.target.value === '' ? 0 : Number(e.target.value))}
                                      placeholder="e.g. 500"
                                      className="w-full text-xs bg-transparent outline-none font-medium text-foreground text-right"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Dynamic Rule Note */}
                              <div className="pt-1.5 border-t border-blue-200/40 dark:border-blue-900/30 flex items-start gap-1.5 text-[11px] text-blue-700 dark:text-blue-300">
                                <span className="font-semibold shrink-0">Rule:</span>
                                <span>
                                  {Number(formik.values.ordering?.deliveryCharge?.freeDeliveryAbove) > 0 ? (
                                    <>
                                      Orders <strong>₹{formik.values.ordering?.deliveryCharge?.freeDeliveryAbove} & above</strong> get <strong>Free Delivery</strong>. Otherwise, <strong>₹{formik.values.ordering?.deliveryCharge?.amount || 0}</strong> applies.
                                    </>
                                  ) : (
                                    <>
                                      Flat <strong>₹{formik.values.ordering?.deliveryCharge?.amount || 0}</strong> applies to all delivery orders.
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Packing Charges */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-zinc-800/40 border border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Packing Charges</p>
                              <p className="text-[11px] text-muted-foreground">Order packaging fees</p>
                            </div>
                          </div>
                          <Switch
                            checked={isPackingEnabled}
                            onCheckedChange={(checked) => {
                              formik.setFieldValue(`ordering.packingCharges.${movKey}.isEnabled`, checked);
                              if (checked) {
                                formik.setFieldValue("ordering.packingCharges.isEnabled", true);
                              }
                            }}
                          />
                        </div>

                        {isPackingEnabled && (
                          <div className="p-2.5 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Packaging Fee (₹)
                              </label>
                              <p className="text-[10px] text-muted-foreground">
                                Packaging charge for {option.label.toLowerCase()} orders
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={packingAmount === 0 ? '' : (packingAmount ?? '')}
                                onChange={(e) => formik.setFieldValue(`ordering.packingCharges.${movKey}.amount`, e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                                className="w-16 text-xs bg-transparent outline-none font-medium text-foreground text-right"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Platform Fee */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-zinc-800/40 border border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                              <Banknote className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Platform Fee</p>
                              <p className="text-[11px] text-muted-foreground">Platform service fees</p>
                            </div>
                          </div>
                          <Switch
                            checked={isPlatformFeeEnabled}
                            onCheckedChange={(checked) => {
                              formik.setFieldValue(`ordering.platformFee.${movKey}.isEnabled`, checked);
                              if (checked) {
                                formik.setFieldValue("ordering.platformFee.isEnabled", true);
                              }
                            }}
                          />
                        </div>

                        {isPlatformFeeEnabled && (
                          <div className="p-2.5 rounded-lg bg-violet-50/40 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-900/40 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Platform Fee (₹)
                              </label>
                              <p className="text-[10px] text-muted-foreground">
                                Flat platform fee per {option.label.toLowerCase()} order
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={platformFeeAmount === 0 ? '' : (platformFeeAmount ?? '')}
                                onChange={(e) => formik.setFieldValue(`ordering.platformFee.${movKey}.amount`, e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                                className="w-16 text-xs bg-transparent outline-none font-medium text-foreground text-right"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tax & Service Fee */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 dark:bg-zinc-800/40 border border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                              <CreditCard className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">Tax & Service Fee</p>
                              <p className="text-[11px] text-muted-foreground">Taxes & service charges</p>
                            </div>
                          </div>
                          <Switch
                            checked={isTaxServiceEnabled}
                            onCheckedChange={(checked) => {
                              formik.setFieldValue(`ordering.taxAndServiceFee.${movKey}.isEnabled`, checked);
                              if (checked) {
                                formik.setFieldValue("ordering.taxAndServiceFee.isEnabled", true);
                              }
                            }}
                          />
                        </div>

                        {isTaxServiceEnabled && (
                          <div className="p-2.5 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Tax & Service (%)
                              </label>
                              <p className="text-[10px] text-muted-foreground">
                                Percentage applied on {option.label.toLowerCase()} subtotal
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1 focus-within:border-primary transition-all shrink-0">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={taxServiceAmount === 0 ? '' : (taxServiceAmount ?? '')}
                                onChange={(e) => formik.setFieldValue(`ordering.taxAndServiceFee.${movKey}.amount`, e.target.value === '' ? 0 : Number(e.target.value))}
                                placeholder="0"
                                className="w-12 text-xs bg-transparent outline-none font-medium text-foreground text-right"
                              />
                              <span className="text-xs font-medium text-muted-foreground">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accepted Payment Methods at Checkout */}
        <div className="space-y-4 pt-6 border-t border-border/50">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Checkout Payment Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CASH */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${formik.values.ordering?.defaultPaymentMethod === "CASH" ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border/50 bg-white dark:bg-zinc-900/30'} transition-colors hover:border-border h-full`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">Pay at Counter / Cash</p>
                    {formik.values.ordering?.defaultPaymentMethod === "CASH" && (
                      <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Allow customers to pay physically.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {paymentMethods.includes("CASH") && formik.values.ordering?.defaultPaymentMethod !== "CASH" && (
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue("ordering.defaultPaymentMethod", "CASH")}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-border/50 bg-white dark:bg-zinc-800 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
                <Switch
                  checked={paymentMethods.includes("CASH")}
                  onCheckedChange={(checked) => handlePaymentMethodChange("CASH", checked)}
                />
              </div>
            </div>

            {/* ONLINE */}
            <div className={`flex flex-col justify-between gap-2 p-4 rounded-xl border ${formik.values.ordering?.defaultPaymentMethod === "ONLINE" ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border/50 bg-white dark:bg-zinc-900/30'} transition-colors hover:border-border h-full`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Online Payment</p>
                      {formik.values.ordering?.defaultPaymentMethod === "ONLINE" && (
                        <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{getOnlineStatusSubtitle()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {paymentMethods.includes("ONLINE") && formik.values.ordering?.defaultPaymentMethod !== "ONLINE" && (
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("ordering.defaultPaymentMethod", "ONLINE")}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-border/50 bg-white dark:bg-zinc-800 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                  <Switch
                    checked={paymentMethods.includes("ONLINE")}
                    onCheckedChange={(checked) => handlePaymentMethodChange("ONLINE", checked)}
                  />
                </div>
              </div>

              {!hasAnyOnlineIntegration && paymentMethods.includes("ONLINE") && (
                <div className="mt-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Enable either Direct UPI or Razorpay below to accept online payments.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT INTEGRATIONS (MUTUALLY EXCLUSIVE) */}
      <div className="pt-6 border-t border-border/50 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h4 className="text-[14px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Payment Integrations
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enable your preferred online payment method (only one can be active at a time).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isUpiEnabled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                Direct UPI Active
              </span>
            )}
            {isRazorpayEnabled && isRazorpayConnected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="h-3 w-3" />
                Razorpay Active
              </span>
            )}
          </div>
        </div>

        {/* TWO INTEGRATION CARDS: 1. ENTER UPI & 2. RAZORPAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. DIRECT UPI PAYMENT */}
          <div className={`flex flex-col p-5 rounded-2xl border transition-all ${
            isUpiEnabled
              ? "border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-950/10 shadow-xs"
              : "border-border/60 bg-white dark:bg-zinc-900/30"
          }`}>
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-foreground">Direct UPI Payment</h5>
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                        0% Fees
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Direct bank settlement via UPI apps</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isUpiEnabled}
                    onCheckedChange={handleToggleUpi}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {/* Short disclaimer line in rounded-md */}
                <div className="p-2.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Direct settlement with 0% fee. Orders are marked Unverified until confirmed by you.</span>
                </div>

                {/* UPI ID INPUT */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Merchant UPI ID (VPA)
                    </label>

                    {hasExistingUpi ? (
                      <button
                        type="button"
                        onClick={() => router.push("/restaurant/profile")}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Change in Profile</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    ) : isValidUpi ? (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Valid VPA
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      disabled={hasExistingUpi}
                      onChange={handleUpiIdChange}
                      placeholder="e.g. restaurant@okaxis or yourname@upi"
                      className={`w-full h-10 px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors outline-none ${
                        hasExistingUpi
                          ? "bg-slate-100 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 cursor-not-allowed border-border/80"
                          : isUpiEnabled && !upiId
                          ? "bg-white dark:bg-zinc-900 border-amber-400 focus:border-amber-500 ring-2 ring-amber-400/20"
                          : "bg-white dark:bg-zinc-900 border-border focus:border-primary"
                      }`}
                    />
                  </div>

                  {hasExistingUpi ? (
                    <p className="text-[11px] text-muted-foreground">
                      Locked to your registered restaurant profile. Click above to change.
                    </p>
                  ) : isUpiEnabled && !upiId ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Please enter your UPI ID so customers can make payments.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* 2. RAZORPAY PAYMENT GATEWAY */}
          <div className={`flex flex-col p-5 rounded-2xl border transition-all ${
            isRazorpayEnabled && isRazorpayConnected
              ? "border-blue-500/40 bg-blue-500/[0.02] dark:bg-blue-950/10 shadow-xs"
              : "border-border/60 bg-white dark:bg-zinc-900/30"
          }`}>
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 p-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src="/assets/logo/razorpay.png"
                        alt="Razorpay"
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-foreground">Razorpay Gateway</h5>
                      {isRazorpayConnected ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Credit/Debit Cards, NetBanking, Wallets</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isRazorpayEnabled && isRazorpayConnected}
                    disabled={!isRazorpayConnected}
                    onCheckedChange={handleToggleRazorpay}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {/* Short disclaimer line in rounded-md */}
                <div className="p-2.5 rounded-md bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>Supports automated checkout for Cards, NetBanking, and Wallets.</span>
                </div>

                {/* Status / Connect Action */}
                <div className="pt-2">
                  {isRazorpayConnected ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-850 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>Razorpay account linked</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {isRazorpayEnabled ? "Active for Checkout" : "Disabled"}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-foreground">Connect Razorpay account</p>
                        <p className="text-[11px] text-muted-foreground">Required to accept automated card payments</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleConnectRazorpay}
                        className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
                      >
                        <LinkIcon className="mr-1.5 h-3 w-3" />
                        Connect Razorpay
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingSection;
