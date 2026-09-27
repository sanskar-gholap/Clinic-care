const nodemailer = require('nodemailer');

// Rate limiting cache for failed login alerts: email -> lastAlertTimestamp
const failedLoginAlertHistory = new Map();

// In-memory record of recent dispatched notifications for admin inspection & testing
const notificationAuditLog = [];

/**
 * Creates and configures the Nodemailer transporter.
 * Supports Gmail App Password via SMTP, or gracefully logs if credentials are unconfigured.
 */
function createTransporter() {
  const mailUser = process.env.MAIL_USER;
  const mailPassword = process.env.MAIL_PASSWORD;

  const isConfigured = (
    mailUser && 
    mailPassword && 
    !mailUser.includes('yourgmail@gmail.com') && 
    !mailPassword.includes('your-gmail-app-password')
  );

  if (isConfigured) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPassword
      }
    });
  }

  // Fallback transporter: logs email dispatch securely without breaking application
  return {
    sendMail: async (mailOptions) => {
      console.log(`[EMAIL DISPATCH - SIMULATED] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
      return {
        messageId: `simulated-${Date.now()}`,
        response: '250 Simulated message queued'
      };
    }
  };
}

/**
 * Formats a Date object into human-readable Date and Time strings
 */
function getFormattedDateTime(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d);
  const date = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const time = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return { date, time };
}

/**
 * Common HTML email layout wrapper with professional ClinicCare styling
 */
function renderEmailTemplate({ title, subtitle, badgeText, badgeColor = '#2563eb', bodyHtml }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 30px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">ClinicCare</span>
                    <span style="display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; background-color: rgba(255, 255, 255, 0.15); color: #93c5fd; padding: 3px 8px; border-radius: 9999px;">Admin Alert</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">${title}</h1>
                    ${subtitle ? `<p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">${subtitle}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 30px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                ClinicCare Automated Security & Administration Service<br>
                Pune Healthcare Directory & Clinical AI System
              </p>
              <p style="margin: 6px 0 0; font-size: 11px; color: #94a3b8;">
                Confidential administrator dispatch. Passwords are never sent, logged, or exposed in plain text.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. REGISTRATION EMAIL
 * Whenever a new user successfully registers, send an email to ADMIN_EMAIL.
 * DO NOT include: Password, Password hash, JWT, or auth tokens.
 */
async function sendRegistrationEmail(user) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cliniccare.com';
    const { date, time } = getFormattedDateTime(user.createdAt || new Date());

    const subject = 'ClinicCare - New User Registration';

    const plainText = `ClinicCare New User Registration

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Registration Date: ${date}
Registration Time: ${time}

Account Status: Successfully Registered
`;

    const bodyHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
          ✓ Account Status: Successfully Registered
        </span>
      </div>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">Name:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">${user.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Email:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #2563eb;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Phone:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${user.phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Registration Date:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Registration Time:</td>
          <td style="padding: 10px 0; font-size: 14px; color: #334155;">${time}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 14px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        🔒 <strong>Security Policy:</strong> Passwords and credentials are never transmitted, stored, or revealed in email notifications.
      </div>
    `;

    const html = renderEmailTemplate({
      title: 'ClinicCare New User Registration',
      subtitle: 'A new patient has registered on the ClinicCare healthcare platform.',
      bodyHtml
    });

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"ClinicCare Notifications" <${process.env.MAIL_USER || 'no-reply@cliniccare.com'}>`,
      to: adminEmail,
      subject,
      text: plainText,
      html
    });

    // Record in memory audit log for dashboard/testing
    notificationAuditLog.unshift({
      type: 'registration',
      recipient: adminEmail,
      subject,
      userName: user.name,
      userEmail: user.email,
      timestamp: new Date(),
      status: 'Sent'
    });
    if (notificationAuditLog.length > 50) notificationAuditLog.pop();

    console.log(`[EMAIL SUCCESS] Registration alert dispatched for ${user.email} -> ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    // IMPORTANT: Never let email sending failure cause registration to fail
    console.error('[EMAIL ERROR - REGISTRATION]:', err.message || err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. LOGIN EMAIL
 * Whenever a user successfully logs in, send an email to ADMIN_EMAIL.
 * DO NOT include the password.
 */
async function sendLoginEmail(user) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cliniccare.com';
    const { date, time } = getFormattedDateTime(new Date());

    const subject = 'ClinicCare - User Login';

    const plainText = `ClinicCare Login Notification

User Name: ${user.name}
Email: ${user.email}
Login Date: ${date}
Login Time: ${time}

Status: Successful Login
`;

    const bodyHtml = `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">
          ✓ Status: Successful Login
        </span>
      </div>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b; width: 140px;">User Name:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #0f172a;">${user.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Email:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #2563eb;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Login Date:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Login Time:</td>
          <td style="padding: 10px 0; font-size: 14px; color: #334155;">${time}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 14px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        🔒 <strong>Security Policy:</strong> Passwords and credentials are never transmitted, stored, or revealed in email notifications.
      </div>
    `;

    const html = renderEmailTemplate({
      title: 'ClinicCare Login Notification',
      subtitle: 'A user has authenticated on the ClinicCare platform.',
      bodyHtml
    });

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"ClinicCare Security" <${process.env.MAIL_USER || 'no-reply@cliniccare.com'}>`,
      to: adminEmail,
      subject,
      text: plainText,
      html
    });

    notificationAuditLog.unshift({
      type: 'login',
      recipient: adminEmail,
      subject,
      userName: user.name,
      userEmail: user.email,
      timestamp: new Date(),
      status: 'Sent'
    });
    if (notificationAuditLog.length > 50) notificationAuditLog.pop();

    console.log(`[EMAIL SUCCESS] Login alert dispatched for ${user.email} -> ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    // IMPORTANT: Never let email sending failure cause login to fail
    console.error('[EMAIL ERROR - LOGIN]:', err.message || err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. FAILED LOGIN NOTIFICATION (with reasonable rate limiting)
 * If a login fails repeatedly (e.g. >= 3 attempts), send security notification to ADMIN_EMAIL.
 * Subject: "ClinicCare - Failed Login Attempt"
 * DO NOT include passwords.
 */
async function sendFailedLoginEmail(email, count = 1) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cliniccare.com';
    const cleanEmail = (email || '').toLowerCase().trim();

    // Rate Limiting: Minimum 5 minutes between alerts for the same email to prevent spamming
    const now = Date.now();
    const lastAlert = failedLoginAlertHistory.get(cleanEmail) || 0;
    const cooldownMs = 5 * 60 * 1000; // 5 minutes

    if (now - lastAlert < cooldownMs && count < 10) {
      console.log(`[EMAIL RATE LIMIT] Skipping failed login email for ${cleanEmail} (sent ${Math.round((now - lastAlert) / 1000)}s ago)`);
      return { success: true, rateLimited: true };
    }

    failedLoginAlertHistory.set(cleanEmail, now);

    const { date, time } = getFormattedDateTime(new Date());
    const subject = 'ClinicCare - Failed Login Attempt';

    const plainText = `ClinicCare - Failed Login Attempt

Email attempted: ${cleanEmail || 'Unknown'}
Time: ${date} at ${time}
Number of recent failed attempts: ${count}

Security Status: Potential unauthorized access attempt detected.
`;

    const bodyHtml = `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
          ⚠️ Security Alert: Multiple Failed Login Attempts Detected
        </span>
      </div>

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b; width: 180px;">Email attempted:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #dc2626;">${cleanEmail || 'Unknown'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #64748b;">Time:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${date} at ${time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">Number of recent failed attempts:</td>
          <td style="padding: 10px 0; font-size: 15px; font-weight: 800; color: #b91c1c;">${count}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 14px; background-color: #fff7ed; border-radius: 10px; border: 1px solid #fed7aa; font-size: 12px; color: #9a3412;">
        🛡️ <strong>Security Safeguard:</strong> Passwords entered during failed attempts are never captured, logged, or included in alerts. Rate limiting is active to protect against notification flooding.
      </div>
    `;

    const html = renderEmailTemplate({
      title: 'ClinicCare - Failed Login Attempt',
      subtitle: 'A series of unauthenticated login attempts was blocked by security filters.',
      bodyHtml
    });

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"ClinicCare Security" <${process.env.MAIL_USER || 'no-reply@cliniccare.com'}>`,
      to: adminEmail,
      subject,
      text: plainText,
      html
    });

    notificationAuditLog.unshift({
      type: 'failed_login',
      recipient: adminEmail,
      subject,
      userEmail: cleanEmail,
      failedAttempts: count,
      timestamp: new Date(),
      status: 'Sent'
    });
    if (notificationAuditLog.length > 50) notificationAuditLog.pop();

    console.log(`[EMAIL SUCCESS] Failed login alert dispatched for ${cleanEmail} (${count} attempts) -> ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EMAIL ERROR - FAILED LOGIN]:', err.message || err);
    return { success: false, error: err.message };
  }
}

/**
 * Returns recent notifications log for Admin Security review and automated test validation
 */
function getNotificationAuditLog() {
  return [...notificationAuditLog];
}

module.exports = {
  sendRegistrationEmail,
  sendLoginEmail,
  sendFailedLoginEmail,
  getNotificationAuditLog
};
