import { getAppBaseUrl } from "../transporter.js";
import { baseEmailLayout, escapeHtml } from "./base-layout.js";

/**
 * Format 24h "HH:mm" string into 12h "hh:mm AM/PM"
 */
function format12Hour(timeStr) {
  if (!timeStr) return "10:00 AM";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const minutePad = String(m).padStart(2, "0");
  return `${hour12}:${minutePad} ${ampm}`;
}

export const lateAttendanceTemplate = {
  name: "late-attendance",
  description: "Advisory notification sent when an employee checks in past scheduled office hours",

  subject: (data) => {
    const count = Number(data.consecutiveLateDays) || 1;
    if (count >= 3) {
      return `Important: 3 Consecutive Days Late Attendance Recorded (${data.date || "Today"}) — TrueHR`;
    }
    if (count === 2) {
      return `Advisory: 2nd Consecutive Late Check-In (${data.date || "Today"}) — TrueHR`;
    }
    return `Late Attendance Recorded for ${data.date || "Today"} — TrueHR`;
  },

  html: (data) => {
    const {
      employeeName = "Team Member",
      employeeId = "",
      date = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      punchTime = "--:--",
      shiftStartTime = "10:00 AM",
      lateMinutes = 0,
      consecutiveLateDays = 1,
      officeName = "Headquarters",
      portalUrl = `${getAppBaseUrl()}/employee/dashboard`,
    } = data;

    const streakCount = Math.max(1, Number(consecutiveLateDays) || 1);
    const lateDurationStr =
      lateMinutes >= 60
        ? `${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m`
        : `${lateMinutes} min${lateMinutes === 1 ? "" : "s"}`;

    const isHighAlert = streakCount >= 3;
    const isMediumAlert = streakCount === 2;

    const bannerBg = isHighAlert ? "#fef2f2" : isMediumAlert ? "#fffbeb" : "#fefce8";
    const bannerBorder = isHighAlert ? "#fecaca" : isMediumAlert ? "#fde68a" : "#fef08a";
    const titleColor = isHighAlert ? "#991b1b" : isMediumAlert ? "#92400e" : "#854d0e";
    const badgeBg = isHighAlert ? "#dc2626" : isMediumAlert ? "#d97706" : "#eab308";

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; line-height: 1.5;">
        Dear <strong>${escapeHtml(employeeName)}</strong>,
      </p>

      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
        This is an automated advisory notification that your attendance check-in for 
        <strong>${escapeHtml(date)}</strong> was recorded past your scheduled office start time.
      </p>

      <!-- Late Summary Card -->
      <div style="background-color: ${bannerBg}; border: 1px solid ${bannerBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align: top; width: 42px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background-color: ${badgeBg}; color: #ffffff; text-align: center; line-height: 36px; font-size: 18px; font-weight: bold;">
                ⏰
              </div>
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: ${titleColor};">
                Late Check-In Recorded (${escapeHtml(lateDurationStr)} late)
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
                Office: ${escapeHtml(officeName)} ${employeeId ? `• ID: ${escapeHtml(employeeId)}` : ""}
              </p>
            </td>
          </tr>
        </table>

        <!-- Punch Metrics Grid -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; border-top: 1px dashed ${bannerBorder}; padding-top: 14px;">
          <tr>
            <td style="width: 50%; padding: 6px 0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Shift Start Time</span>
              <div style="font-size: 15px; font-weight: 600; color: #1e293b; margin-top: 2px;">
                ${escapeHtml(format12Hour(shiftStartTime))}
              </div>
            </td>
            <td style="width: 50%; padding: 6px 0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Your Punch Time</span>
              <div style="font-size: 15px; font-weight: 700; color: #dc2626; margin-top: 2px;">
                ${escapeHtml(format12Hour(punchTime))}
              </div>
            </td>
          </tr>
          <tr>
            <td style="width: 50%; padding: 6px 0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Late Delay</span>
              <div style="font-size: 15px; font-weight: 600; color: #92400e; margin-top: 2px;">
                ${escapeHtml(lateDurationStr)}
              </div>
            </td>
            <td style="width: 50%; padding: 6px 0;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Consecutive Late Days</span>
              <div style="font-size: 15px; font-weight: 700; color: ${isHighAlert ? "#dc2626" : "#1e293b"}; margin-top: 2px;">
                ${streakCount} Day${streakCount > 1 ? "s" : ""} ${isHighAlert ? "(Threshold Reached)" : isMediumAlert ? "(Warning: Day 2)" : ""}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Consecutive Days Visual Tracker -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          Consecutive Late Arrival Tracker:
        </div>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width: 32%; text-align: center; padding: 8px 4px; border-radius: 6px; background-color: ${streakCount >= 1 ? "#fed7aa" : "#e2e8f0"}; color: ${streakCount >= 1 ? "#9a3412" : "#64748b"}; font-size: 12px; font-weight: 600;">
              Day 1 ${streakCount === 1 ? "● Today" : "✓ Late"}
            </td>
            <td style="width: 2%;"></td>
            <td style="width: 32%; text-align: center; padding: 8px 4px; border-radius: 6px; background-color: ${streakCount >= 2 ? "#fed7aa" : "#f1f5f9"}; color: ${streakCount >= 2 ? "#9a3412" : "#94a3b8"}; font-size: 12px; font-weight: 600;">
              Day 2 ${streakCount === 2 ? "● Today" : streakCount > 2 ? "✓ Late" : "—"}
            </td>
            <td style="width: 2%;"></td>
            <td style="width: 32%; text-align: center; padding: 8px 4px; border-radius: 6px; background-color: ${streakCount >= 3 ? "#fecaca" : "#f1f5f9"}; color: ${streakCount >= 3 ? "#991b1b" : "#94a3b8"}; font-size: 12px; font-weight: 700;">
              Day 3 ${streakCount >= 3 ? "⚠️ Policy Trigger" : "—"}
            </td>
          </tr>
        </table>
      </div>

      <!-- Company Policy Callout Box -->
      <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; border-radius: 4px 10px 10px 4px; padding: 16px 20px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1e293b;">
          📋 Attendance Policy Reminder:
        </h4>
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #334155; line-height: 1.6;">
          Please note that as per company attendance policy, <strong>if late attendance is marked for 3 consecutive days, 1 day will be marked as absent</strong>.
        </p>
        <p style="margin: 0; font-size: 12.5px; color: #64748b; line-height: 1.5; font-style: italic;">
          * Note: This email is an informational advisory intended to keep you updated on your daily punctuality. No absence deduction has been applied to your record at this time.
        </p>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 13.5px; color: #475569; line-height: 1.6;">
        We understand that unexpected delays or traffic disruptions occur occasionally. 
        If you have an ongoing concern or if this punch was logged late due to official off-site work, 
        please submit a regularisation request via your TrueHR employee portal or coordinate with HR Operations.
      </p>

      <!-- Action Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0 10px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #ef4444;">
            <a href="${escapeHtml(portalUrl)}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
              View My Attendance Dashboard →
            </a>
          </td>
        </tr>
      </table>
    `;

    return baseEmailLayout({
      title: "Late Attendance Advisory",
      preheader: `Late Check-In on ${date} (${lateDurationStr} late). Policy reminder: 3 consecutive late days will result in 1 day marked absent.`,
      contentHtml,
    });
  },

  text: (data) => {
    const count = Number(data.consecutiveLateDays) || 1;
    return (
      `Dear ${data.employeeName || "Team Member"},\n\n` +
      `Late Attendance Advisory — ${data.date || "Today"}\n\n` +
      `Your attendance check-in was logged at ${data.punchTime || "--:--"} (Scheduled Shift: ${data.shiftStartTime || "10:00 AM"}).\n` +
      `Late Delay: ${data.lateMinutes || 0} minutes\n` +
      `Consecutive Late Days: ${count}\n\n` +
      `POLICY NOTICE:\n` +
      `Please note that as per company attendance policy, if late attendance is marked for 3 consecutive days, 1 day will be marked as absent.\n\n` +
      `* Note: This email is an informational advisory. No absence deduction has been applied at this time.\n\n` +
      `Portal: ${data.portalUrl || `${getAppBaseUrl()}/employee/dashboard`}\n\n` +
      `Best regards,\nTrueHR People Operations`
    );
  },
};

export default lateAttendanceTemplate;

