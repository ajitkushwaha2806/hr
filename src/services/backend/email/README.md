# TrueHR Emailing Service & Templates Architecture

A modular, plug-and-play email service for TrueHR. Define your email templates inside the `templates/` folder and trigger emails from anywhere with a single function call.

---

## 🚀 Quick Usage

### 1. Send an Email using a Template
```javascript
import { sendTemplateEmail } from "@/services/email";

// Send a welcome email to a new employee
await sendTemplateEmail({
  to: "ajit@company.com",
  template: "welcome-employee",
  data: {
    name: "Ajit Kushwaha",
    employeeId: "EMP-1004",
    department: "Engineering",
    designation: "Full Stack Engineer",
    email: "ajit@company.com",
    loginUrl: "https://truehr.magicscale.in/sign-in",
  },
});
```

### 2. Send a Direct Email (Custom HTML)
```javascript
import { sendEmail } from "@/services/email";

await sendEmail({
  to: "user@example.com",
  subject: "Important System Notice",
  html: "<p>Your shift timing has been updated for tomorrow.</p>",
});
```

---

## 📁 How to Define a New Email Template

All email templates live in `src/services/backend/email/templates/`.

### Step 1: Create a template file: `templates/my-new-template.js`
```javascript
import { baseEmailLayout, escapeHtml } from "./base-layout.js";

export const myNewTemplate = {
  name: "project-assigned",
  description: "Notifies an employee when assigned to a new project",

  // Subject line (can be a string or a dynamic function)
  subject: (data) => `New Project Assigned: ${data.projectName || "Project"}`,

  // HTML Body (rendered inside the responsive TrueHR base layout)
  html: (data) => {
    const { name = "Colleague", projectName = "", deadline = "" } = data;

    const contentHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px;">
        Hello <strong>${escapeHtml(name)}</strong>,
      </p>
      <p style="color: #475569;">
        You have been assigned to <strong>${escapeHtml(projectName)}</strong>.
      </p>
      <p style="color: #64748b; font-size: 13px;">
        Deadline: ${escapeHtml(deadline || "TBD")}
      </p>
    `;

    return baseEmailLayout({
      title: "New Project Assignment",
      preheader: `You have been assigned to ${projectName}.`,
      contentHtml,
    });
  },

  // Plain-text version (fallback)
  text: (data) =>
    `Hello ${data.name},\n\nYou have been assigned to ${data.projectName}. Deadline: ${data.deadline}.\n`,
};

export default myNewTemplate;
```

### Step 2: Register it in `templates/index.js`
Import it and add it to the list:
```javascript
import { myNewTemplate } from "./my-new-template.js";

// Add to registry:
registerTemplate("project-assigned", myNewTemplate);
```

### Step 3: Hit the service from anywhere!
```javascript
await sendTemplateEmail({
  to: "employee@example.com",
  template: "project-assigned",
  data: {
    name: "Ajit",
    projectName: "Mobile App V2",
    deadline: "Dec 15, 2026",
  },
});
```

---

## 📦 Built-In Templates

| Template Key | Purpose | Required / Common Data |
| :--- | :--- | :--- |
| `welcome-employee` | Onboarding email with credentials & login portal link | `name`, `employeeId`, `department`, `designation`, `email`, `loginUrl`, `temporaryPassword` |
| `leave-status` | Leave approval or rejection notifications | `name`, `status` (`APPROVED`/`REJECTED`), `leaveType`, `dayType`, `startDate`, `endDate`, `adminRemarks` |
| `attendance-alert` | Missed punch-out, late arrival, or geofence alert | `name`, `alertType`, `date`, `message`, `details`, `actionRequired` |
| `payslip-ready` | Monthly salary slip generated notification | `name`, `month`, `year`, `netSalary`, `downloadUrl` |
| `otp-verification` | One-time password / security code | `name`, `otp`, `expiresInMinutes`, `actionType` |
| `general-notification` | Multipurpose company announcement or alert | `name`, `headline`, `message`, `bulletPoints`, `callToAction: { label, url }` |

---

## ⚙️ Environment Configuration (`.env`)

Add standard SMTP credentials to your `.env` file for production delivery:

```env
# SMTP Server Configuration (e.g., Gmail, SendGrid, AWS SES, Resend, Mailgun)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hr@yourcompany.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# Sender Identity
EMAIL_FROM="TrueHR People Operations" <no-reply@yourcompany.com>
```

> **Developer Safe Fallback**: If no SMTP credentials are configured, the service will **NOT** crash. It runs in mock preview mode, logging the formatted email to the server console with complete debug info.

---

## 🌐 API Endpoint

You can also trigger emails via HTTP request:
- **`POST /api/email/send`**
```json
{
  "to": "employee@example.com",
  "template": "welcome-employee",
  "data": {
    "name": "Ajit Kushwaha",
    "employeeId": "EMP-1004"
  }
}
```

- **Preview rendered template without sending**:
```json
{
  "template": "welcome-employee",
  "data": { "name": "Ajit" },
  "previewOnly": true
}
```

