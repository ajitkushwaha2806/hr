import { useState } from "react";
import api from "@/lib/api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Plus, Trash2, Copy, Check, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const AWS_SERVER_IP = "35.154.158.6";
const AWS_CNAME_TARGET = "tenant.getrepeat.in";

const CustomDomainCard = ({ domain }) => {
  const { restaurantId } = useRestaurant();
  const notification = useNotification();
  
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  
  const currentDomain = domain || "";
  const hasDomain = !!currentDomain;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notification.success(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const { mutate: updateRestaurant, isPending: isUpdatingDomain } = useFormMutation({
    mutationFn: (payload) => RestaurantService.updateRestaurant(restaurantId, payload),
    queryKey: ["restaurant-details", restaurantId],
    invalidateKeys: [["restaurant-details", restaurantId], ["all-restaurants"]],
    extractUpdatedData: (response) => response?.data?.restaurant || response?.restaurant,
    successMessage: "Domain updated successfully!"
  });

  const handleDomainSubmit = () => {
    if (!domainInput.trim()) {
      notification.error("Please enter a domain");
      return;
    }

    const cleanInput = domainInput.trim().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
    
    updateRestaurant(
      { domain: cleanInput },
      {
        onSuccess: () => {
          setIsDomainModalOpen(false);
          setDomainInput("");
          setVerificationStatus(null);
        },
        onError: (err) => {
           notification.error(err.message || "Failed to connect domain");
        }
      }
    );
  };

  const handleDisconnectDomain = () => {
    if (confirm("Are you sure you want to disconnect your custom domain?")) {
      updateRestaurant({ domain: "" });
      setVerificationStatus(null);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      const res = await api.get(`/api/restaurant/${restaurantId}/domain`);
      const data = res.data;
      
      setVerificationStatus(data.verified ? "verified" : "unverified");
      
      if (data.verified) {
        notification.success("Domain DNS configuration verified successfully!");
      } else {
        notification.error(data.message || "Domain DNS is not yet properly configured.");
      }
    } catch (err) {
      notification.error(err.message || "Failed to verify domain");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Card className="shadow-none flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="relative h-6 w-6 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
              <Globe className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />
            </div>
            Custom Domain
          </CardTitle>
          <CardDescription>
            {hasDomain
              ? "Your custom domain is linked to your AWS storefront."
              : "Connect your branded domain (e.g. yourrestaurant.com) to your storefront."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 justify-between gap-4">
          {hasDomain ? (
            <div className="flex flex-col gap-3 h-full justify-between">
              <div className={`p-4 border rounded-xl transition-all ${
                verificationStatus === 'verified' 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' 
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50'
              }`}>
                {/* Domain Link & Status Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <a 
                      href={`https://${currentDomain}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sm font-bold text-gray-900 dark:text-gray-100 underline hover:text-primary transition-colors flex items-center gap-1 truncate"
                    >
                      {currentDomain}
                      <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                    </a>
                  </div>

                  {verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="size-3" /> Active & Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full shrink-0">
                      <AlertCircle className="size-3" /> Setup Required
                    </span>
                  )}
                </div>

                {/* DNS Setup Instructions */}
                {verificationStatus !== 'verified' ? (
                  <div className="mt-3.5 space-y-2.5 text-xs">
                    <p className="text-[11.5px] text-amber-900 dark:text-amber-200 font-medium">
                      Add the following DNS records in your domain provider (GoDaddy, Cloudflare, Namecheap, Route 53):
                    </p>

                    <div className="overflow-x-auto rounded-lg border border-amber-200/80 dark:border-amber-800/60 bg-white/80 dark:bg-zinc-900/80">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-amber-100/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-bold border-b border-amber-200/60">
                          <tr>
                            <th className="px-2.5 py-1.5">Type</th>
                            <th className="px-2.5 py-1.5">Name</th>
                            <th className="px-2.5 py-1.5">Value / Target</th>
                            <th className="px-1.5 py-1.5 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100 dark:divide-zinc-800 text-gray-700 dark:text-gray-300">
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">A</td>
                            <td className="px-2.5 py-1.5 font-mono">@</td>
                            <td className="px-2.5 py-1.5 font-mono font-semibold">{AWS_SERVER_IP}</td>
                            <td className="px-1.5 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleCopy(AWS_SERVER_IP, "ip")}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy IP"
                              >
                                {copiedKey === "ip" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2.5 py-1.5 font-mono font-bold text-purple-600 dark:text-purple-400">CNAME</td>
                            <td className="px-2.5 py-1.5 font-mono">www</td>
                            <td className="px-2.5 py-1.5 font-mono font-semibold">{AWS_CNAME_TARGET}</td>
                            <td className="px-1.5 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleCopy(AWS_CNAME_TARGET, "cname")}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                title="Copy CNAME target"
                              >
                                {copiedKey === "cname" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11.5px] text-emerald-800 dark:text-emerald-300 mt-2">
                    Traffic for <strong>{currentDomain}</strong> and <strong>www.{currentDomain}</strong> is successfully routing to your AWS storefront.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2.5">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="h-8 text-xs font-semibold px-3 shadow-2xs"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-primary" />
                        Verifying DNS...
                      </>
                    ) : (
                      "Verify DNS"
                    )}
                  </Button>
                </div>

                <Button 
                  type="button"
                  onClick={handleDisconnectDomain} 
                  disabled={isUpdatingDomain}
                  variant="destructive"
                  size="sm"
                  className="h-8 rounded-md shadow-xs font-semibold text-xs px-3"
                >
                  {isUpdatingDomain ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 size={13} className="mr-1.5" strokeWidth={2.5} />}
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-auto">
              <div />
              <Button 
                type="button"
                onClick={() => setIsDomainModalOpen(true)} 
                disabled={isUpdatingDomain}
                size="sm"
                className="h-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold text-xs"
              >
                <Plus size={14} className="mr-1.5" strokeWidth={2.5} />
                Connect Domain
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDomainModalOpen} onOpenChange={setIsDomainModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Link your custom domain to your restaurant storefront hosted on AWS.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-2">
              <label htmlFor="domainInput" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Domain Name
              </label>
              <Input
                id="domainInput"
                placeholder="e.g. therusticspoon.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="h-9 text-xs sm:text-sm font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Enter your apex domain (e.g. <code>myrestaurant.com</code>). Both apex and <code>www</code> will route to your AWS storefront.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 border p-3 text-[11px] space-y-1.5">
              <p className="font-semibold text-foreground">Required DNS records after connecting:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><span className="font-semibold text-foreground">A Record:</span> Host <code>@</code> → <code>{AWS_SERVER_IP}</code></li>
                <li><span className="font-semibold text-foreground">CNAME:</span> Host <code>www</code> → <code>{AWS_CNAME_TARGET}</code></li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDomainModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDomainSubmit} disabled={isUpdatingDomain}>
              {isUpdatingDomain && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Connect Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomDomainCard;
