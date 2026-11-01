import nodemailer from "nodemailer";

/**
 * Creates and caches the nodemailer transporter based on environment config
 */
let transporterInstance = null;

export function getAppBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_APP ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://truehr.magicscale.in";
}

export function getEmailConfig() {
  const service = process.env.SMTP_SERVICE || (process.env.SMTP_HOST?.includes("gmail") ? "gmail" : "gmail");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || "truehr.payroll@gmail.com";
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const appBaseUrl = getAppBaseUrl();

  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (user ? `"TrueHR" <${user}>` : `"TrueHR" <truehr.payroll@gmail.com>`);

  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    (user || "truehr.payroll@gmail.com");

  const hasCredentials = Boolean(user && pass);

  return {
    service,
    host,
    port,
    user,
    pass,
    secure,
    from,
    supportEmail,
    appBaseUrl,
    hasCredentials,
  };
}

export function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  const config = getEmailConfig();

  if (config.hasCredentials) {
    // Google Workspace / Gmail setup
    if (config.service === "gmail" || config.host.includes("gmail")) {
      transporterInstance = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    } else {
      transporterInstance = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });
    }
  } else {
    // Development / Fallback Mock Transporter
    // Logs emails to console and returns success without crashing when credentials are not configured yet
    transporterInstance = {
      isMock: true,
      sendMail: async (mailOptions) => {
        const timestamp = new Date().toISOString();
        console.log(`\n================== [TRUEHR EMAIL SERVICE (DEV PREVIEW)] ==================`);
        console.log(`⏰ Timestamp: ${timestamp}`);
        console.log(`📤 From:      ${mailOptions.from || config.from}`);
        console.log(`📥 To:        ${mailOptions.to}`);
        if (mailOptions.cc) console.log(`📋 CC:        ${mailOptions.cc}`);
        if (mailOptions.bcc) console.log(`📋 BCC:       ${mailOptions.bcc}`);
        console.log(`📌 Subject:   ${mailOptions.subject}`);
        console.log(`--------------------------------------------------------------------------`);
        if (mailOptions.text) {
          console.log(`📝 Plaintext:\n${mailOptions.text.slice(0, 300)}...`);
        }
        console.log(`💻 HTML Length: ${mailOptions.html ? mailOptions.html.length : 0} bytes`);
        console.log(`ℹ️ [Notice] Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env for live delivery.`);
        console.log(`==========================================================================\n`);

        return {
          accepted: [mailOptions.to],
          rejected: [],
          messageId: `<mock-${Date.now()}@truehr.dev>`,
          response: "250 Mock Email logged successfully",
          isMock: true,
        };
      },
      verify: async () => {
        return true;
      },
    };
  }

  return transporterInstance;
}

/**
 * Tests connection to the SMTP server
 */
export async function verifyTransporterConnection() {
  const config = getEmailConfig();
  if (!config.hasCredentials) {
    return {
      connected: false,
      isMock: true,
      message: "No SMTP credentials set. Email service is running in mock/preview mode.",
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      connected: true,
      isMock: false,
      message: `Successfully connected to SMTP server at ${config.host}:${config.port}`,
    };
  } catch (error) {
    return {
      connected: false,
      isMock: false,
      error: error.message,
      message: `Failed to connect to SMTP server: ${error.message}`,
    };
  }
}

const emailTransporterService = {
  getAppBaseUrl,
  getEmailConfig,
  getTransporter,
  verifyTransporterConnection,
};

export default emailTransporterService;
