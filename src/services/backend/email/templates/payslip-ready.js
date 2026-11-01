import { baseEmailLayout, escapeHtml } from "./base-layout.js";
import { getAppBaseUrl } from "../transporter.js";

/**
 * Payslip Ready Email Template
 * Sent to an employee when their monthly salary slip is generated
 */
export const payslipReadyTemplate = {
  name: "payslip-ready",
  description: "Sent when monthly salary slip is available for download",

  subject: (data) =>
    `Payslip Ready for ${data.month || "Current Month"} ${data.year || new Date().getFullYear()} 💼`,

  html: (data) => {
    const {
      name = "Employee",
      employeeId = "",
      month = "October",
      year = new Date().getFullYear(),
      netSalary = "",
      payPeriod = "",
      downloadUrl = `${getAppBaseUrl()}/employee/profile`,
    } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        Your salary slip for <strong>${escapeHtml(month)} ${escapeHtml(String(year))}</strong> has been generated and is now available in your TrueHR portal.
      </p>

      <!-- Salary Summary Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px 24px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;">Employee ID:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-family: monospace;">${escapeHtml(employeeId || "—")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Pay Period:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(payPeriod || `${month} ${year}`)}</td>
              </tr>
              ${
                netSalary
                  ? `<tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 15px;">Net Disbursed:</td>
                      <td style="padding: 8px 0; font-weight: 800; color: #10b981; font-size: 18px;">${escapeHtml(netSalary)}</td>
                    </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b;">
        Please review your salary slip for deductions, allowances, and attendance calculations. If you notice any discrepancies, contact the payroll team within 5 working days.
      </p>

      <!-- CTA Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #0f172a;">
            <a href="${escapeHtml(downloadUrl)}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px;">
              View / Download Payslip →
            </a>
          </td>
        </tr>
      </table>
    `;

    return baseEmailLayout({
      title: "Monthly Salary Slip Ready",
      preheader: `Your payslip for ${month} ${year} is ready to view.`,
      contentHtml,
    });
  },

  text: (data) =>
    `Hello ${data.name || "Employee"},\n\n` +
    `Your payslip for ${data.month || ""} ${data.year || ""} is ready.\n` +
    (data.netSalary ? `Net Salary: ${data.netSalary}\n` : "") +
    `View and download at: ${data.downloadUrl || `${getAppBaseUrl()}/employee/profile`}\n`,
};

export default payslipReadyTemplate;

