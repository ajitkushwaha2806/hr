import { baseEmailLayout, escapeHtml } from "./base-layout.js";
import { getAppBaseUrl } from "../transporter.js";

/**
 * Welcome Email Template for newly onboarded employees
 */
export const welcomeEmployeeTemplate = {
  name: "welcome-employee",
  description: "Sent to newly onboarded employees with their profile details and access link",

  subject: (data) =>
    `Welcome to the Team, ${data.name || "Colleague"}! 🎉 Your TrueHR Account Details`,

  html: (data) => {
    const {
      name = "Employee",
      employeeId = "",
      department = "General",
      designation = "",
      email = "",
      loginUrl = `${getAppBaseUrl()}/sign-in`,
      temporaryPassword = "",
    } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; color: #475569;">
        We are thrilled to welcome you to our organization! Your employee profile has been created and your TrueHR workplace portal is now ready for you.
      </p>

      <!-- Account Info Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px 24px;">
            <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
              Your Profile Information
            </h3>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;">Employee ID:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-family: monospace;">${escapeHtml(employeeId || "Assigned on Portal")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Department:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(department)}</td>
              </tr>
              ${
                designation
                  ? `<tr>
                      <td style="padding: 6px 0; color: #64748b;">Designation:</td>
                      <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(designation)}</td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Official Email:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${escapeHtml(email)}</td>
              </tr>
              ${
                temporaryPassword
                  ? `<tr>
                      <td style="padding: 6px 0; color: #64748b;">Temporary Password:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #ef4444; font-family: monospace;">${escapeHtml(temporaryPassword)}</td>
                    </tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
      </table>

      <!-- Next Steps -->
      <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a;">
        What you should do next:
      </h4>
      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #475569; line-height: 1.6;">
        <li>Log in to your TrueHR Employee Portal.</li>
        <li>Review and verify your personal and bank account details.</li>
        <li>Complete biometric face enrollment for seamless attendance check-in.</li>
        <li>Review your attendance calendar and monthly leave balance.</li>
      </ul>

      <!-- CTA Button -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #ef4444;">
            <a href="${escapeHtml(loginUrl)}" target="_blank" style="display: inline-block; padding: 14px 30px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
              Access TrueHR Portal →
            </a>
          </td>
        </tr>
      </table>
    `;

    return baseEmailLayout({
      title: "Welcome to the Team!",
      preheader: `Welcome to the team! Your TrueHR portal account for ${name} is ready.`,
      contentHtml,
    });
  },

  text: (data) =>
    `Welcome to the Team, ${data.name || "Colleague"}!\n\n` +
    `Your TrueHR employee account has been set up.\n` +
    `Employee ID: ${data.employeeId || "N/A"}\n` +
    `Department: ${data.department || "General"}\n` +
    `Designation: ${data.designation || "N/A"}\n` +
    `Email: ${data.email || "N/A"}\n\n` +
    `Log in at: ${data.loginUrl || `${getAppBaseUrl()}/sign-in`}\n`,
};

export default welcomeEmployeeTemplate;

