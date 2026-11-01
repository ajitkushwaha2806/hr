import { baseEmailLayout, escapeHtml } from "./base-layout.js";

export const generalNotificationTemplate = {
  name: "general-notification",
  description: "Multipurpose template for company announcements, updates, or custom messages",

  subject: (data) =>
    data.subject || "Notification from HR Operations",

  html: (data) => {
    const {
      name = "Colleague",
      headline = "",
      message = "",
      bodyHtml = "",
      bulletPoints = [],
      callToAction = null, // { label: string, url: string }
      badge = "",
      notes = "",
    } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>

      ${
        badge
          ? `<div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 999px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${escapeHtml(badge)}
            </div>`
          : ""
      }

      ${
        headline
          ? `<h2 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.4;">
              ${escapeHtml(headline)}
            </h2>`
          : ""
      }

      ${
        message
          ? `<p style="margin: 0 0 18px 0; color: #334155; line-height: 1.6;">
              ${escapeHtml(message)}
            </p>`
          : ""
      }

      ${bodyHtml ? `<div style="margin: 18px 0;">${bodyHtml}</div>` : ""}

      ${
        Array.isArray(bulletPoints) && bulletPoints.length > 0
          ? `<ul style="margin: 0 0 20px 0; padding-left: 20px; color: #475569; line-height: 1.6;">
              ${bulletPoints.map((bp) => `<li>${escapeHtml(bp)}</li>`).join("")}
            </ul>`
          : ""
      }

      ${
        callToAction?.url && callToAction?.label
          ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 26px 0;">
              <tr>
                <td align="center" style="border-radius: 10px; background-color: #ef4444;">
                  <a href="${escapeHtml(callToAction.url)}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px;">
                    ${escapeHtml(callToAction.label)} →
                  </a>
                </td>
              </tr>
            </table>`
          : ""
      }

      ${
        notes
          ? `<p style="margin: 18px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
              ${escapeHtml(notes)}
            </p>`
          : ""
      }
    `;

    return baseEmailLayout({
      title: headline || "HR Notification",
      preheader: message ? message.slice(0, 100) : "Important notification from TrueHR.",
      contentHtml,
    });
  },

  text: (data) =>
    `Hello ${data.name || "Colleague"},\n\n` +
    (data.headline ? `${data.headline}\n\n` : "") +
    (data.message ? `${data.message}\n\n` : "") +
    (data.callToAction?.url ? `Link: ${data.callToAction.url}\n\n` : ""),
};

export default generalNotificationTemplate;

