import { welcomeEmployeeTemplate } from "./welcome-employee.js";
import { leaveStatusTemplate } from "./leave-status.js";
import { attendanceAlertTemplate } from "./attendance-alert.js";
import { lateAttendanceTemplate } from "./late-attendance.js";
import { payslipReadyTemplate } from "./payslip-ready.js";
import { otpVerificationTemplate } from "./otp-verification.js";
import { generalNotificationTemplate } from "./general-notification.js";
import { baseEmailLayout, escapeHtml } from "./base-layout.js";

const templateRegistry = new Map();

[
  welcomeEmployeeTemplate,
  leaveStatusTemplate,
  attendanceAlertTemplate,
  lateAttendanceTemplate,
  payslipReadyTemplate,
  otpVerificationTemplate,
  generalNotificationTemplate,
].forEach((tpl) => {
  if (tpl && tpl.name) {
    templateRegistry.set(tpl.name.toLowerCase(), tpl);
  }
});

export function registerTemplate(name, template) {
  if (!name || !template) {
    throw new Error("Template name and template definition are required");
  }
  if (typeof template.html !== "function") {
    throw new Error(`Template "${name}" must provide an "html(data)" function`);
  }
  templateRegistry.set(name.toLowerCase(), {
    name: name.toLowerCase(),
    description: template.description || "Custom template",
    ...template,
  });
}

export function getTemplate(name) {
  if (!name) return null;
  return templateRegistry.get(name.toLowerCase()) || null;
}

export function listTemplates() {
  return Array.from(templateRegistry.values()).map((t) => ({
    name: t.name,
    description: t.description || "",
  }));
}

export function renderTemplate(template, data = {}) {
  let tpl = null;

  if (typeof template === "string") {
    tpl = getTemplate(template);
    if (!tpl) {
      throw new Error(
        `Email template "${template}" not found. Available templates: ${Array.from(
          templateRegistry.keys()
        ).join(", ")}`
      );
    }
  } else if (typeof template === "object" && template !== null) {
    tpl = template;
  } else {
    throw new Error("Invalid template argument. Expected string or template object.");
  }

  let subject = "Notification";
  if (typeof tpl.subject === "function") {
    subject = tpl.subject(data);
  } else if (typeof tpl.subject === "string") {
    subject = tpl.subject;
  } else if (data.subject) {
    subject = data.subject;
  }

  let html = "";
  if (typeof tpl.html === "function") {
    html = tpl.html(data);
  } else if (typeof tpl.html === "string") {
    html = tpl.html;
  } else {
    throw new Error(`Template "${tpl.name || "custom"}" does not provide valid html output.`);
  }

  let text = "";
  if (typeof tpl.text === "function") {
    text = tpl.text(data);
  } else if (typeof tpl.text === "string") {
    text = tpl.text;
  } else {
    text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  return { subject, html, text };
}

export {
  welcomeEmployeeTemplate,
  leaveStatusTemplate,
  attendanceAlertTemplate,
  lateAttendanceTemplate,
  payslipReadyTemplate,
  otpVerificationTemplate,
  generalNotificationTemplate,
  baseEmailLayout,
  escapeHtml,
};

const templateService = {
  registerTemplate,
  getTemplate,
  listTemplates,
  renderTemplate,
};

export default templateService;
