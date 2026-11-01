/**
 * Convenient Shortcut Export for TrueHR Email Service
 *
 * Usage:
 *   import { emailService, sendTemplateEmail, sendEmail } from "@/services/email";
 *
 *   await sendTemplateEmail({
 *     to: "employee@example.com",
 *     template: "welcome-employee",
 *     data: { name: "Ajit", employeeId: "EMP-1004" }
 *   });
 */

export * from "../backend/email/index.js";
export { default } from "../backend/email/index.js";

