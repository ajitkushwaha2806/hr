import { getAppBaseUrl } from "../transporter.js";
import { baseEmailLayout, escapeHtml } from "./base-layout.js";

export const leaveRequestedAdminTemplate = {
  name: "leave-requested-admin",
  description: "Notification sent to HR/Admins when an employee submits a new leave application",

  subject: (data) => {
    const days = data.daysCount ? `${data.daysCount}d` : "1d";
    return `New Leave Request: ${data.employeeName || "Employee"} (${data.leaveType || "Leave"}, ${days}) — TrueHR`;
  },

  html: (data) => {
    const {
      employeeName = "Employee",
      employeeId = "",
      department = "General",
      leaveType = "Casual Leave",
      dayType = "FULL_DAY",
      startDate = "",
      endDate = "",
      daysCount = 1,
      reason = "No reason specified",
      appliedAt = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      reviewUrl = `${getAppBaseUrl()}/admin/leaves`,
    } = data;

    const dayTypeLabel =
      dayType === "FIRST_HALF"
        ? "Half Day (First Half)"
        : dayType === "SECOND_HALF"
        ? "Half Day (Second Half)"
        : "Full Day";

    const dateRangeStr =
      startDate && endDate && startDate !== endDate
        ? `${startDate} to ${endDate}`
        : startDate || "Scheduled Date";

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; line-height: 1.5;">
        Hello <strong>Admin Team</strong>,
      </p>

      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
        A new leave application has been submitted by <strong>${escapeHtml(employeeName)}</strong> and is awaiting your review.
      </p>

      <!-- Review Alert Card -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px 22px; margin-bottom: 24px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align: top; width: 40px;">
              <div style="width: 34px; height: 34px; border-radius: 50%; background-color: #d97706; color: #ffffff; text-align: center; line-height: 34px; font-size: 16px; font-weight: bold;">
                ⏳
              </div>
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                Action Required • Pending Decision
              </div>
              <h2 style="margin: 3px 0 0 0; font-size: 16px; font-weight: 700; color: #92400e;">
                ${escapeHtml(employeeName)} — ${escapeHtml(leaveType)}
              </h2>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #78350f;">
                Applied on ${escapeHtml(appliedAt)} ${employeeId ? `• ID: ${escapeHtml(employeeId)}` : ""} • Dept: ${escapeHtml(department)}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Leave Details Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px 24px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 7px 0; color: #64748b; width: 140px; font-weight: 500;">Applicant:</td>
                <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                  ${escapeHtml(employeeName)} ${employeeId ? `(${escapeHtml(employeeId)})` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Department:</td>
                <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                  ${escapeHtml(department)}
                </td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Leave Type:</td>
                <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                  <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 2px 10px; border-radius: 6px; font-size: 12.5px; font-weight: 700;">
                    ${escapeHtml(leaveType)}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Duration:</td>
                <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">
                  ${escapeHtml(String(daysCount))} day${daysCount === 1 ? "" : "s"} (${escapeHtml(dayTypeLabel)})
                </td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Date Range:</td>
                <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">
                  ${escapeHtml(dateRangeStr)}
                </td>
              </tr>
              <tr>
                <td style="padding: 9px 0 0 0; color: #64748b; font-weight: 500; vertical-align: top;">Reason:</td>
                <td style="padding: 9px 0 0 0; color: #334155; line-height: 1.5;">
                  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-style: italic;">
                    &quot;${escapeHtml(reason)}&quot;
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Action Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #ef4444;">
            <a href="${escapeHtml(reviewUrl)}" target="_blank" style="display: inline-block; padding: 13px 30px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
              Review &amp; Approve in Admin Portal →
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: left;">
        You can approve or reject this request directly with customized remarks from the TrueHR Admin Portal.
      </p>
    `;

    return baseEmailLayout({
      title: "New Leave Application",
      preheader: `New leave request from ${employeeName} for ${dateRangeStr} (${daysCount}d ${leaveType}).`,
      contentHtml,
    });
  },

  text: (data) =>
    `Hello Admin Team,\n\n` +
    `A new leave application has been submitted and is awaiting your review.\n\n` +
    `Employee: ${data.employeeName || "Employee"} (${data.employeeId || ""})\n` +
    `Department: ${data.department || "General"}\n` +
    `Leave Type: ${data.leaveType || "Casual Leave"} (${data.dayType || "FULL_DAY"})\n` +
    `Duration: ${data.daysCount || 1} day(s)\n` +
    `Dates: ${data.startDate} to ${data.endDate}\n` +
    `Reason: "${data.reason || "N/A"}"\n\n` +
    `Review in Admin Portal: ${data.reviewUrl || `${getAppBaseUrl()}/admin/leaves`}\n\n` +
    `TrueHR Automated HR Dispatch`,
};

export default leaveRequestedAdminTemplate;

