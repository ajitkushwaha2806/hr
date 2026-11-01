import { getAppBaseUrl } from "../transporter.js";

export function baseEmailLayout({
  title = "Notification from TrueHR",
  preheader = "",
  contentHtml = "",
  companyName = "TrueHR Management",
  companyWebsite = getAppBaseUrl(),
  supportEmail = process.env.SUPPORT_EMAIL || "truehr.payroll@gmail.com",
  year = new Date().getFullYear(),
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; color: #334155;">
  <!-- Preheader text for email client inbox snippet -->
  ${
    preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #fff;">
          ${escapeHtml(preheader)}
        </div>`
      : ""
  }

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (max-width: 600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 36px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: 800; font-size: 18px; padding: 6px 12px; border-radius: 8px; letter-spacing: -0.5px;">
                      TrueHR
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94a3b8; font-weight: 500;">
                      HR & People Operations
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      ${escapeHtml(title)}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Help / Info Strip -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b;">
                <strong>Need help or have questions?</strong> Reach out to HR Operations at 
                <a href="mailto:${escapeHtml(supportEmail)}" style="color: #ef4444; text-decoration: none; font-weight: 600;">
                  ${escapeHtml(supportEmail)}
                </a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
                <a href="${escapeHtml(companyWebsite)}" target="_blank" style="color: #64748b; text-decoration: none;">
                  ${escapeHtml(companyName)}
                </a>
              </p>
              <p style="margin: 0 0 10px 0;">
                Automated HR Notification • Please do not reply directly to this email unless instructed.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                © ${year} ${escapeHtml(companyName)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default baseEmailLayout;
