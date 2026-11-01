import { getTransporter, getEmailConfig, verifyTransporterConnection } from "./transporter.js";
import {
  renderTemplate,
  registerTemplate,
  getTemplate,
  listTemplates,
  baseEmailLayout,
  escapeHtml,
} from "./templates/index.js";

/**
 * Universal Email Service for TrueHR
 */
export const emailService = {
  /**
   * Send an email using any registered template from the templates folder
   *
   * @example
   * await emailService.sendTemplateEmail({
   *   to: "employee@company.com",
   *   template: "welcome-employee",
   *   data: {
   *     name: "Ajit Kushwaha",
   *     employeeId: "EMP-1004",
   *     department: "Engineering"
   *   }
   * });
   *
   * @param {object} options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string|object} options.template - Template name (e.g. "welcome-employee", "leave-status", "attendance-alert", "payslip-ready", "otp-verification", "general-notification")
   * @param {object} [options.data] - Data payload passed into the template
   * @param {string} [options.subject] - Optional custom subject to override template subject
   * @param {string|string[]} [options.cc] - Optional CC email address(es)
   * @param {string|string[]} [options.bcc] - Optional BCC email address(es)
   * @param {string} [options.from] - Optional custom sender email address
   * @param {string} [options.replyTo] - Optional Reply-To address
   * @param {Array} [options.attachments] - Array of nodemailer attachment objects [{ filename, content|path, contentType }]
   * @returns {Promise<{ success: boolean, messageId: string, to: string|string[], subject: string, isMock: boolean }>}
   */
  async sendTemplateEmail({
    to,
    template,
    data = {},
    subject: overrideSubject,
    cc,
    bcc,
    from,
    replyTo,
    attachments = [],
  }) {
    if (!to) {
      throw new Error("Recipient email address ('to') is required");
    }
    if (!template) {
      throw new Error("Template name or definition is required");
    }

    // 1. Render template HTML, text, and subject
    const rendered = renderTemplate(template, data);
    const finalSubject = overrideSubject || rendered.subject;

    // 2. Dispatch email
    return this.sendEmail({
      to,
      subject: finalSubject,
      html: rendered.html,
      text: rendered.text,
      cc,
      bcc,
      from,
      replyTo,
      attachments,
    });
  },

  /**
   * Send a direct email with raw HTML / text
   *
   * @example
   * await emailService.sendEmail({
   *   to: "user@example.com",
   *   subject: "Custom Subject",
   *   html: "<h1>Hello</h1><p>Custom email body</p>",
   * });
   *
   * @param {object} options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject line
   * @param {string} [options.html] - HTML content of the email
   * @param {string} [options.text] - Plain text content fallback
   * @param {string|string[]} [options.cc] - Optional CC email address(es)
   * @param {string|string[]} [options.bcc] - Optional BCC email address(es)
   * @param {string} [options.from] - Optional custom sender email address
   * @param {string} [options.replyTo] - Optional Reply-To address
   * @param {Array} [options.attachments] - Array of nodemailer attachment objects
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    from,
    replyTo,
    attachments = [],
  }) {
    if (!to) {
      throw new Error("Recipient email address ('to') is required");
    }
    if (!subject) {
      throw new Error("Email subject is required");
    }

    const config = getEmailConfig();
    const transporter = getTransporter();

    const mailOptions = {
      from: from || config.from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html: html || "",
      text: text || "",
      ...(cc ? { cc: Array.isArray(cc) ? cc.join(", ") : cc } : {}),
      ...(bcc ? { bcc: Array.isArray(bcc) ? bcc.join(", ") : bcc } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
        isMock: Boolean(info.isMock),
        response: info.response,
      };
    } catch (error) {
      console.error("[EmailService Error] Failed to send email:", error);
      throw error;
    }
  },

  /**
   * Register a new custom template dynamically
   */
  registerTemplate(name, templateDefinition) {
    return registerTemplate(name, templateDefinition);
  },

  /**
   * Retrieve a registered template definition
   */
  getTemplate(name) {
    return getTemplate(name);
  },

  /**
   * List all available template names and descriptions
   */
  getAvailableTemplates() {
    return listTemplates();
  },

  /**
   * Render a template without sending (useful for previewing or debugging)
   */
  renderTemplate(templateName, data = {}) {
    return renderTemplate(templateName, data);
  },

  /**
   * Verify SMTP connection status
   */
  async verifyConnection() {
    return verifyTransporterConnection();
  },

  /**
   * Helper to build custom branded HTML using the base layout
   */
  baseLayout: baseEmailLayout,
  escapeHtml,
};

// Top-level function shortcuts for maximum simplicity
export const sendTemplateEmail = (options) => emailService.sendTemplateEmail(options);
export const sendEmail = (options) => emailService.sendEmail(options);

export default emailService;

