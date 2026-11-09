"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  Mail,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useNotification from "@/store/hooks/useNotification";

const TEMPLATE_OPTIONS = [
  {
    id: "general-notification",
    label: "General Notice / Custom Message",
    description: "Send a company notice, update, or custom message",
  },
  {
    id: "late-attendance",
    label: "Late Attendance Advisory",
    description: "Advisory notice for late check-in & 3-day consecutive policy reminder",
  },
  {
    id: "welcome-employee",
    label: "Welcome & Portal Invitation",
    description: "Welcome email with employee ID & portal access link",
  },
  {
    id: "attendance-alert",
    label: "Attendance Alert / Warning",
    description: "Missed punch-out, irregular hours, or regularisation alert",
  },
  {
    id: "payslip-ready",
    label: "Payslip Ready Notification",
    description: "Notify employee that their salary slip is available",
  },
];

export function SendEmailModal({ isOpen, onClose, employee }) {
  const notification = useNotification();

  const [template, setTemplate] = useState("general-notification");
  const [isSending, setIsSending] = useState(false);

  // Form fields for general-notification
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");

  // Form fields for attendance-alert
  const [alertType, setAlertType] = useState("Missed Check-Out");
  const [actionRequired, setActionRequired] = useState("Please contact HR Operations to regularise.");

  // Form fields for late-attendance
  const [lateMinutes, setLateMinutes] = useState(30);
  const [consecutiveLateDays, setConsecutiveLateDays] = useState(1);

  if (!isOpen || !employee) return null;

  const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name;

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const origin =
        typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_BASE_APP || process.env.NEXT_PUBLIC_APP_URL || "https://truehr.magicscale.in";

      let payloadData = {};

      if (template === "general-notification") {
        payloadData = {
          name: fullName,
          subject: subject.trim() || "Important HR Notice",
          headline: headline.trim() || "Message from People Operations",
          message: message.trim() || "Please review your HR portal for updates.",
          callToAction: {
            label: "Open TrueHR Portal",
            url: `${origin}/employee/dashboard`,
          },
        };
      } else if (template === "late-attendance") {
        payloadData = {
          employeeName: fullName,
          employeeId: employee.employeeId || "",
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          punchTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          shiftStartTime: "10:00 AM",
          lateMinutes: Number(lateMinutes) || 30,
          consecutiveLateDays: Number(consecutiveLateDays) || 1,
          officeName: "Headquarters",
          portalUrl: `${origin}/employee/dashboard`,
        };
      } else if (template === "welcome-employee") {
        payloadData = {
          name: fullName,
          employeeId: employee.employeeId || "",
          department: employee.department || "General",
          designation: employee.designation || "",
          email: employee.email,
          loginUrl: `${origin}/sign-in`,
        };
      } else if (template === "attendance-alert") {
        payloadData = {
          name: fullName,
          employeeId: employee.employeeId,
          date: new Date().toISOString().split("T")[0],
          alertType,
          message: message.trim() || "An attendance irregularity was recorded for your shift.",
          actionRequired,
          portalUrl: `${origin}/employee/dashboard`,
        };
      } else if (template === "payslip-ready") {
        payloadData = {
          name: fullName,
          employeeId: employee.employeeId,
          month: new Date().toLocaleString("en-US", { month: "long" }),
          year: new Date().getFullYear(),
          netSalary: employee.salary ? `₹ ${Number(employee.salary).toLocaleString("en-IN")}` : "",
          downloadUrl: `${origin}/employee/profile`,
        };
      }

      const res = await axios.post("/api/email/send", {
        to: employee.email,
        template,
        data: payloadData,
        subject: subject.trim() || undefined,
      });

      if (res.data?.success) {
        notification.success(`Email successfully sent to ${employee.email}`);
        onClose();
        // Reset form
        setSubject("");
        setHeadline("");
        setMessage("");
      } else {
        notification.error(res.data?.message || "Failed to dispatch email");
      }
    } catch (err) {
      console.error("Email send error:", err);
      notification.error(err.response?.data?.message || err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground border-t sm:border border-border p-4 sm:p-5 pb-8 sm:pb-5 pb-safe rounded-t-md sm:rounded-md max-w-lg w-full space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Mail className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Send Email</h3>
              <p className="text-xs text-muted-foreground">
                To: <span className="font-medium text-foreground">{fullName}</span> ({employee.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          {/* Template Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Select Email Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-full text-xs h-9 rounded-md">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Template Fields */}
          {template === "late-attendance" && (
            <div className="space-y-3 p-3.5 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 rounded-md">
              <div className="flex items-center gap-1.5 text-orange-800 dark:text-orange-300 font-semibold text-xs">
                <span>⏰</span>
                <span>Late Attendance Policy Advisory</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Sends a formal punctuality notice with shift start comparison, delay time, and the standard policy reminder: <em>&quot;3 consecutive days of late attendance results in 1 day marked as absent&quot;</em>.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs">Minutes Late</Label>
                  <Input
                    type="number"
                    min="1"
                    max="480"
                    value={lateMinutes}
                    onChange={(e) => setLateMinutes(e.target.value)}
                    className="h-8 text-xs rounded-md bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Consecutive Late Days</Label>
                  <Select
                    value={String(consecutiveLateDays)}
                    onValueChange={(val) => setConsecutiveLateDays(Number(val))}
                  >
                    <SelectTrigger className="w-full text-xs h-8 rounded-md bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-xs">Day 1 (Advisory)</SelectItem>
                      <SelectItem value="2" className="text-xs">Day 2 (Warning)</SelectItem>
                      <SelectItem value="3" className="text-xs">Day 3 (Policy Threshold)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                ℹ️ Note: This email is purely an advisory notification and does not alter the employee&apos;s actual attendance punch status.
              </div>
            </div>
          )}

          {template === "general-notification" && (
            <div className="space-y-3 p-3.5 bg-muted/20 border border-border/50 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Email Subject Line</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Schedule Update for Next Week"
                  className="h-8 text-xs rounded-md"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Headline / Title</Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Important Announcement from HR"
                  className="h-8 text-xs rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Message Body</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the employee here..."
                  className="text-xs rounded-md min-h-[90px]"
                  required
                />
              </div>
            </div>
          )}

          {template === "welcome-employee" && (
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 rounded-md space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                <Sparkles className="size-3.5" />
                <span>Onboarding Welcome Invite</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Will dispatch the standard welcome letter with Employee ID (<strong>{employee.employeeId}</strong>), Department (<strong>{employee.department}</strong>), and the direct link to activate their account and complete biometric enrollment.
              </p>
            </div>
          )}

          {template === "attendance-alert" && (
            <div className="space-y-3 p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Alert Category</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger className="w-full text-xs h-8 rounded-md bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Missed Check-Out" className="text-xs">Missed Check-Out</SelectItem>
                    <SelectItem value="Late Arrival" className="text-xs">Late Arrival Notice</SelectItem>
                    <SelectItem value="Outside Geofence" className="text-xs">Outside Geofence Attempt</SelectItem>
                    <SelectItem value="Unmarked Absence" className="text-xs">Unmarked Absence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Custom Note / Explanation</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Our system recorded that you did not clock out on your previous shift..."
                  className="text-xs rounded-md bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Action Required</Label>
                <Input
                  value={actionRequired}
                  onChange={(e) => setActionRequired(e.target.value)}
                  className="h-8 text-xs rounded-md bg-background"
                />
              </div>
            </div>
          )}

          {template === "payslip-ready" && (
            <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 rounded-md space-y-2">
              <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-semibold text-xs">
                <CheckCircle2 className="size-3.5" />
                <span>Monthly Payroll Notification</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Will notify {fullName} that their payslip for {new Date().toLocaleString("en-US", { month: "long" })} {new Date().getFullYear()} is generated and ready to download on their portal.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSending}
              className="h-8 text-xs rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSending}
              className="h-8 text-xs gap-1.5 rounded-md shadow-xs"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Send Email</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendEmailModal;
