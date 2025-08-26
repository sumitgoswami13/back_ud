// services/email.service.js
import transporter from "../config/email.js";

const FROM_EMAIL = process.env.EMAIL_FROM;
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Deco Platform";

/**
 * Send welcome email with temporary password
 */
export async function sendWelcomeEmail({ email, firstName, lastName, tempPassword }) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to Deco Platform - Your Account Details",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Deco Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Deco Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Thank you for registering with Deco Platform. Your account has been successfully created!</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <ul>
                <li>This is a temporary password that can only be used once</li>
                <li>After your first login, you'll need to use the "Forgot Password" feature to set a new password</li>
                <li>Please keep this information secure and do not share it with anyone</li>
              </ul>
            </div>

            <p>You can now log in to your account and start using our services.</p>
            
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>&copy; 2025 Deco Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Deco Platform!
      
      Hello ${firstName} ${lastName},
      
      Thank you for registering with Deco Platform. Your account has been successfully created!
      
      Your Login Credentials:
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      IMPORTANT: This is a temporary password that can only be used once. After your first login, you'll need to use the "Forgot Password" feature to set a new password.
      
      If you didn't create this account, please ignore this email.
      
      © 2025 Deco Platform. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

/**
 * Send OTP email for password reset
 */
export async function sendForgotPasswordOTP({ email, otp, firstName }) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Password Reset OTP - Deco Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #dc2626; }
          .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: monospace; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'User'},</h2>
            <p>We received a request to reset your password for your Deco Platform account.</p>
            
            <div class="otp-box">
              <h3>Your OTP Code:</h3>
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 15px; color: #6b7280;">This code will expire in 10 minutes</p>
            </div>

            <div class="warning">
              <strong>🛡️ Security Notice:</strong>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email.</p>
              <p>&copy; 2025 Deco Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - Deco Platform
      
      Hello ${firstName || 'User'},
      
      We received a request to reset your password for your Deco Platform account.
      
      Your OTP Code: ${otp}
      
      This code will expire in 10 minutes.
      
      SECURITY NOTICE:
      - Never share this OTP with anyone
      - Our team will never ask for your OTP
      - If you didn't request this, please ignore this email
      
      © 2025 Deco Platform. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Forgot password OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending forgot password OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

/**
 * Send email verification OTP
 */
export async function sendEmailVerificationOTP({ email, otp, firstName }) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification OTP - Deco Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #059669; }
          .otp-code { font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 8px; font-family: monospace; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'User'},</h2>
            <p>Please verify your email address to complete your account setup.</p>
            
            <div class="otp-box">
              <h3>Your Verification Code:</h3>
              <div class="otp-code">${otp}</div>
              <p style="margin-top: 15px; color: #6b7280;">This code will expire in 10 minutes</p>
            </div>

            <p>Enter this code in the verification form to activate your account.</p>
            
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>&copy; 2025 Deco Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Email Verification - Deco Platform
      
      Hello ${firstName || 'User'},
      
      Please verify your email address to complete your account setup.
      
      Your Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      Enter this code in the verification form to activate your account.
      
      If you didn't create this account, please ignore this email.
      
      © 2025 Deco Platform. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification OTP sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email verification OTP:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send document status change notification
 */
export async function sendDocumentStatusEmail({ email, firstName, documentType, status, transactionId }) {
  const statusMessages = {
    pending: { title: "Document Received", color: "#6b7280", icon: "📄" },
    under_review: { title: "Document Under Review", color: "#f59e0b", icon: "🔍" },
    approved: { title: "Document Approved", color: "#059669", icon: "✅" },
    rejected: { title: "Document Rejected", color: "#dc2626", icon: "❌" },
    signed: { title: "Document Signed", color: "#7c3aed", icon: "✍️" }
  };

  const statusInfo = statusMessages[status] || statusMessages.pending;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${statusInfo.title} - ${documentType} | Deco Platform`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusInfo.color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color}; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.icon} ${statusInfo.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'User'},</h2>
            <p>We're writing to update you on the status of your document submission.</p>
            
            <div class="status-box">
              <h3>Document Status Update</h3>
              <div class="details">
                <p><strong>Document Type:</strong> ${documentType}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>New Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${status.toUpperCase()}</span></p>
                <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>

            ${status === 'approved' ? `
              <div style="background: #f0fdf4; border: 1px solid #059669; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>🎉 Great news!</strong> Your document has been approved and is ready for the next step in the process.</p>
              </div>
            ` : ''}

            ${status === 'rejected' ? `
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>📋 Action Required:</strong> Your document needs attention. Please review and resubmit with the necessary corrections.</p>
              </div>
            ` : ''}

            ${status === 'signed' ? `
              <div style="background: #faf5ff; border: 1px solid #7c3aed; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>✅ Complete!</strong> Your document has been successfully signed and processed.</p>
              </div>
            ` : ''}

            <p>You can log in to your account to view more details and take any necessary actions.</p>
            
            <div class="footer">
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <p>&copy; 2025 Deco Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Document Status Update - Deco Platform
      
      Hello ${firstName || 'User'},
      
      We're writing to update you on the status of your document submission.
      
      Document Details:
      - Document Type: ${documentType}
      - Transaction ID: ${transactionId}
      - New Status: ${status.toUpperCase()}
      - Updated: ${new Date().toLocaleString()}
      
      ${status === 'approved' ? 'Great news! Your document has been approved and is ready for the next step.' : ''}
      ${status === 'rejected' ? 'Action Required: Your document needs attention. Please review and resubmit with corrections.' : ''}
      ${status === 'signed' ? 'Complete! Your document has been successfully signed and processed.' : ''}
      
      You can log in to your account to view more details.
      
      If you have any questions, please contact our support team.
      
      © 2025 Deco Platform. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Document status email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending document status email:', error);
    throw new Error('Failed to send document status email');
  }
}

/**
 * Send password reset success notification
 */
export async function sendPasswordResetSuccessEmail({ email, firstName }) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Password Reset Successful - Deco Platform",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .success-box { background: #f0fdf4; border: 1px solid #059669; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Successful</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'User'},</h2>
            
            <div class="success-box">
              <p><strong>✅ Success!</strong> Your password has been successfully reset.</p>
              <p>You can now log in to your account using your new password.</p>
            </div>

            <p>If you didn't make this change, please contact our support team immediately.</p>
            
            <div class="footer">
              <p>For security reasons, we recommend using a strong, unique password.</p>
              <p>&copy; 2025 Deco Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Successful - Deco Platform
      
      Hello ${firstName || 'User'},
      
      Your password has been successfully reset.
      You can now log in to your account using your new password.
      
      If you didn't make this change, please contact our support team immediately.
      
      For security reasons, we recommend using a strong, unique password.
      
      © 2025 Deco Platform. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset success email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset success email:', error);
    throw new Error('Failed to send password reset success email');
  }
}