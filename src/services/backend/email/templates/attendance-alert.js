import { getAppBaseUrl } from "../transporter.js";
import { baseEmailLayout, escapeHtml } from "./base-layout.js";

export const attendanceAlertTemplate = {
  name: "attendance-alert",
  description: "Alert notification for attendance anomalies (missed checkout, absence, geofence issue)",

  subject: (data) =>
    `Attendance Alert: ${data.alertType || "Action Required"} (${data.date || "Today"})`,

  html: (data) => {
    const {
      name = "Employee",
      employeeId = "",
      date = new Date().toISOString().split("T")[0],
      alertType = "Missed Check-Out",
      message = "You did not record a check-out punch for your shift.",
      details = "",
      actionRequired = "Please submit a regularisation request or contact HR Operations.",
      portalUrl = `${getAppBaseUrl()}/employee/dashboard`,
    } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>

      <!-- Alert Banner -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 18px; margin-right: 10px;">⚠️</span>
          <div>
            <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #92400e;">
              ${escapeHtml(alertType)}
            </h3>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #b45309;">
              Date: <strong>${escapeHtml(date)}</strong> ${employeeId ? `• Emp ID: ${escapeHtml(employeeId)}` : ""}
            </p>
          </div>
        </div>
      </div>

      <p style="margin: 0 0 16px 0; color: #334155; line-height: 1.6;">
        ${escapeHtml(message)}
      </p>

      ${
        details
          ? `<div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px 18px; margin-bottom: 20px; font-size: 13px; color: #475569;">
              ${escapeHtml(details)}
            </div>`
          : ""
      }

      <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #334155;">
        <strong>Recommended Action:</strong> ${escapeHtml(actionRequired)}
      </div>

      <!-- CTA Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #ef4444;">
            <a href="${escapeHtml(portalUrl)}" target="_blank" style="display: inline-block; padding: 12px 26px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
              Open Attendance Dashboard →
            </a>
          </td>
        </tr>
      </table>
    `;

    return baseEmailLayout({
      title: "Attendance Notification",
      preheader: `Attendance Alert: ${alertType} on ${date}.`,
      contentHtml,
    });
  },

  text: (data) =>
    `Hello ${data.name || "Employee"},\n\n` +
    `Attendance Alert: ${data.alertType || "Missed Check-Out"}\n` +
    `Date: ${data.date}\n\n` +
    `${data.message}\n\n` +
    `Action Required: ${data.actionRequired || "Contact HR"}\n` +
    `Portal: ${data.portalUrl || `${getAppBaseUrl()}/employee/dashboard`}\n`,
};

export default attendanceAlertTemplate;

