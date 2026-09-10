import nodemailer from 'nodemailer';

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
  const mailOptions = {
    from: `"MECELFAB Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Send to the official company email
    subject: `New Inquiry Received: ${inquiryData.referenceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Service Request Received</h2>
        <p>A new inquiry was submitted on the website.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ref No</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.referenceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.company || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.service || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.location || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${inquiryData.message || 'N/A'}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
        </p>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};

export const sendCustomerInquiryConfirmation = async (customerEmail, customerName, referenceNumber) => {
  const mailOptions = {
    from: `"MECELFAB" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `We've received your inquiry (Ref: ${referenceNumber})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${customerName},</h2>
        <p>Thank you for reaching out to MECELFAB. We have received your inquiry and our team is currently reviewing your requirements.</p>
        <p>Your reference number is <strong>${referenceNumber}</strong>. Please keep this for your records.</p>
        <p>One of our project engineers will get back to you shortly to discuss your project in detail.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>The MECELFAB Team</strong></p>
      </div>
    `,
  };

  await sendMailSafe(mailOptions);
};
