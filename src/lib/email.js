import nodemailer from 'nodemailer';

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return str || '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendMailSafe = async (options) => {
  if (!transporter) {
    console.warn('[MECELFAB] SMTP not configured. Email not sent:', options.subject);
    return;
  }
  return transporter.sendMail(options);
};

export const sendVerificationEmail = async (email, token) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"MECELFAB" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to MECELFAB</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"MECELFAB" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

export const sendAdminInquiryNotification = async (inquiryData) => {
  const safe = {
    name: escapeHtml(inquiryData.name),
    company: escapeHtml(inquiryData.company),
    email: escapeHtml(inquiryData.email),
    phone: escapeHtml(inquiryData.phone),
    service: escapeHtml(inquiryData.service),
    location: escapeHtml(inquiryData.location),
    timeline: escapeHtml(inquiryData.timeline),
    message: escapeHtml(inquiryData.message),
    referenceNumber: escapeHtml(inquiryData.referenceNumber),
  };
  const mailOptions = {
    from: `"MECELFAB Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: `New Service Request — ${safe.referenceNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0a0a0a; padding: 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 16px; font-weight: 300; letter-spacing: 2px; margin: 0;">NEW SERVICE REQUEST</h1>
          <p style="color: #888; font-size: 12px; margin: 8px 0 0;">${safe.referenceNumber}</p>
        </div>

        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 120px;">Reference</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.referenceNumber}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Name</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.name}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Company</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.company || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Service</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.service || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Location</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.location || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Timeline</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${safe.timeline || 'N/A'}</td></tr>
            <tr><td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Description</td><td style="padding: 10px 12px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${safe.message || 'N/A'}</td></tr>
          </table>

          <p style="margin: 24px 0 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">View in Admin Panel</a>
          </p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

export const sendCustomerInquiryConfirmation = async (customerEmail, customerName, referenceNumber) => {
  const safeName = escapeHtml(customerName);
  const mailOptions = {
    from: `"MECELFAB Industrial Solutions" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Your inquiry has been received — ${referenceNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0a0a0a; padding: 32px; text-align: center;">
          <h1 style="color: #fff; font-size: 20px; font-weight: 300; letter-spacing: 3px; margin: 0;">MECELFAB</h1>
          <p style="color: #888; font-size: 11px; letter-spacing: 2px; margin: 4px 0 0;">INDUSTRIAL SOLUTIONS</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 400; margin: 0 0 16px;">Hello ${safeName},</h2>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Thank you for reaching out to MECELFAB. We have received your service inquiry and our engineering team is currently reviewing your requirements.
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-left: 3px solid #000; margin: 24px 0;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin: 0 0 4px;">Your Reference Number</p>
            <p style="font-size: 20px; font-weight: 600; margin: 0; color: #000;">${referenceNumber}</p>
          </div>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            What happens next:
          </p>
          <ol style="font-size: 14px; line-height: 1.8; margin: 0 0 24px; padding-left: 20px; color: #555;">
            <li>Our team will review your project requirements</li>
            <li>A project engineer will assess the technical scope</li>
            <li>We will contact you for any clarifications if needed</li>
            <li>A commercial response will be shared within 2–3 business days</li>
          </ol>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            For urgent requirements, you can reach us directly at <a href="mailto:mecelfab@gmail.com" style="color: #000;">mecelfab@gmail.com</a>.
          </p>

          <p style="font-size: 14px; margin: 0;">Best Regards,</p>
          <p style="font-size: 14px; font-weight: 600; margin: 4px 0 0;">The MECELFAB Team</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 16px; text-align: center;">
          <p style="font-size: 11px; color: #888; margin: 0;">
            MECELFAB Industrial Solutions Private Limited &middot; mecelfabpvtltd.com
          </p>
        </div>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};
