import { baseEmailLayout, escapeHtml } from "./base-layout.js";
import { getAppBaseUrl } from "../transporter.js";

export const leaveStatusTemplate = {
  name: "leave-status",
  description: "Notification for leave request status updates (Approved / Rejected)",

  subject: (data) => {
    const isApproved = String(data.status).toUpperCase() === "APPROVED";
    return `Leave Request ${isApproved ? "Approved ✅" : "Rejected ❌"} - ${data.leaveType || "Leave"}`;
  },

  html: (data) => {
    const {
      name = "Employee",
      status = "APPROVED",
      leaveType = "Casual Leave",
      dayType = "FULL_DAY",
      startDate = "",
      endDate = "",
      daysCount = 1,
      adminRemarks = "",
      reviewedBy = "HR Administration",
      portalUrl = `${getAppBaseUrl()}/employee/leaves`,
    } = data;

    const isApproved = String(status).toUpperCase() === "APPROVED";
    const statusColor = isApproved ? "#10b981" : "#ef4444";
    const statusBg = isApproved ? "#ecfdf5" : "#fef2f2";
    const statusBorder = isApproved ? "#a7f3d0" : "#fecaca";

    const dayTypeLabel =
      dayType === "FIRST_HALF"
        ? "Half Day (First Half)"
        : dayType === "SECOND_HALF"
        ? "Half Day (Second Half)"
        : "Full Day";

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        Your leave application has been reviewed by ${escapeHtml(reviewedBy)}. Please find the details below:
      </p>

      <!-- Status Badge Box -->
      <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 12px; padding: 18px 24px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
          Decision
        </span>
        <span style="font-size: 20px; font-weight: 800; color: ${statusColor};">
          ${isApproved ? "APPROVED" : "REJECTED"}
        </span>
      </div>

      <!-- Leave Details Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px 24px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;">Leave Type:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(leaveType)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Duration:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">
                  ${escapeHtml(String(daysCount))} day${daysCount === 1 ? "" : "s"} (${escapeHtml(dayTypeLabel)})
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Date(s):</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">
                  ${escapeHtml(startDate)} ${endDate && endDate !== startDate ? `to ${escapeHtml(endDate)}` : ""}
                </td>
              </tr>
              ${
                adminRemarks
                  ? `<tr>
                      <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Admin Remarks:</td>
                      <td style="padding: 6px 0; color: #334155; font-style: italic;">"${escapeHtml(adminRemarks)}"</td>
                    </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #0f172a;">
            <a href="${escapeHtml(portalUrl)}" target="_blank" style="display: inline-block; padding: 12px 26px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
              View Leave Balance & History →
            </a>
          </td>
        </tr>
      </table>
    `;

    return baseEmailLayout({
      title: `Leave Request: ${isApproved ? "Approved" : "Rejected"}`,
      preheader: `Your leave request for ${startDate} has been ${status.toLowerCase()}.`,
      contentHtml,
    });
  },

  text: (data) =>
    `Hello ${data.name || "Employee"},\n\n` +
    `Your leave application for ${data.leaveType || "Leave"} (${data.startDate} to ${data.endDate || data.startDate}) has been ${String(data.status).toUpperCase()}.\n` +
    `Duration: ${data.daysCount || 1} day(s)\n` +
    (data.adminRemarks ? `Admin Remarks: "${data.adminRemarks}"\n` : "") +
    `\nView your leaves at: ${data.portalUrl || `${getAppBaseUrl()}/employee/leaves`}\n`,
};

export default leaveStatusTemplate;

