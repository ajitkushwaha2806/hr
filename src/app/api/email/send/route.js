import { emailService } from "@/services/backend/email";
import { getAuthContext } from "@/lib/api/helpers/auth";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

/**
 * POST /api/email/send
 * Dispatch an email using a template or raw content
 *
 * Payload:
 * {
 *   to: "user@example.com",
 *   template: "welcome-employee" | "leave-status" | "attendance-alert" | "payslip-ready" | "otp-verification" | "general-notification",
 *   data: { ...templateVariables },
 *   subject: "Optional custom subject",
 *   previewOnly: false
 * }
 */
export const POST = withErrorHandler(async (req) => {
  await getAuthContext();

  const body = await req.json();
  const { to, template, data = {}, subject, html, text, cc, bcc, previewOnly = false } = body || {};

  if (!to && !previewOnly) {
    throw new BadRequestError("Recipient email ('to') is required");
  }

  // If preview mode is requested, return rendered output without sending
  if (previewOnly) {
    if (!template) {
      throw new BadRequestError("Template name is required for preview mode");
    }
    const rendered = emailService.renderTemplate(template, data);
    return successResponse(rendered, "Template rendered preview generated");
  }

  // If template is provided, send via template
  if (template) {
    const result = await emailService.sendTemplateEmail({
      to,
      template,
      data,
      subject,
      cc,
      bcc,
    });
    return successResponse(result, "Template email dispatched successfully");
  }

  // If raw HTML / subject is provided
  if (!subject) {
    throw new BadRequestError("Either 'template' or 'subject' must be provided");
  }

  const result = await emailService.sendEmail({
    to,
    subject,
    html,
    text,
    cc,
    bcc,
  });

  return successResponse(result, "Email dispatched successfully");
});

/**
 * GET /api/email/send
 * Returns list of available templates and SMTP status
 */
export const GET = withErrorHandler(async () => {
  await getAuthContext();

  const templates = emailService.getAvailableTemplates();
  const connection = await emailService.verifyConnection();

  return successResponse(
    {
      templates,
      smtpStatus: connection,
    },
    "Email service status retrieved"
  );
});

