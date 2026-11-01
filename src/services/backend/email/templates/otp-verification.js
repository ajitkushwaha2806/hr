import { baseEmailLayout, escapeHtml } from "./base-layout.js";

/**
 * OTP / Verification Code Email Template
 */
export const otpVerificationTemplate = {
  name: "otp-verification",
  description: "One-time password or security verification code",

  subject: (data) =>
    `Your TrueHR Verification Code: ${data.otp || "••••••"}`,

  html: (data) => {
    const {
      name = "User",
      otp = "000000",
      expiresInMinutes = 10,
      actionType = "account verification",
    } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        You recently requested a security code for <strong>${escapeHtml(actionType)}</strong>. Use the verification code below to proceed:
      </p>

      <!-- Large OTP Box -->
      <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 24px; margin: 24px 0; text-align: center;">
        <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px;">
          One-Time Verification Code
        </span>
        <div style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a; padding: 8px 0;">
          ${escapeHtml(otp)}
        </div>
        <span style="font-size: 12px; color: #ef4444; font-weight: 500;">
          Expires in ${escapeHtml(String(expiresInMinutes))} minutes
        </span>
      </div>

      <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
        Never share this code with anyone, including TrueHR staff. If you did not make this request, please contact your company administrator immediately.
      </p>
    `;

    return baseEmailLayout({
      title: "Security Verification Code",
      preheader: `Your verification code is ${otp}. Valid for ${expiresInMinutes} minutes.`,
      contentHtml,
    });
  },

  text: (data) =>
    `Hello ${data.name || "User"},\n\n` +
    `Your verification code for ${data.actionType || "verification"} is: ${data.otp}\n` +
    `Valid for ${data.expiresInMinutes || 10} minutes.\n\n` +
    `If you did not request this code, please ignore this email.\n`,
};

export default otpVerificationTemplate;

