// services/email.service.js
import transporter from "../config/email.js";

const FROM_EMAIL = process.env.EMAIL_FROM;
const FROM_NAME = process.env.EMAIL_FROM_NAME || "udin.in";

/**
 * Send welcome email with temporary password
 */
export async function sendWelcomeEmail({ email, firstName, lastName, tempPassword }) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to udin.in - Your Account Details",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to udin.in</title>
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
            <h1>Welcome to udin.in!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Thank you for registering with udin.in. Your account has been successfully created!</p>
            
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
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to udin.in!
      
      Hello ${firstName} ${lastName},
      
      Thank you for registering with udin.in. Your account has been successfully created!
      
      Your Login Credentials:
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      IMPORTANT: This is a temporary password that can only be used once. After your first login, you'll need to use the "Forgot Password" feature to set a new password.
      
      If you didn't create this account, please ignore this email.
      
      © 2025 udin.in. All rights reserved.
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
    subject: "Password Reset OTP - udin.in",
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
            <p>We received a request to reset your password for your udin.in account.</p>
            
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
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - udin.in
      
      Hello ${firstName || 'User'},
      
      We received a request to reset your password for your udin.in account.
      
      Your OTP Code: ${otp}
      
      This code will expire in 10 minutes.
      
      SECURITY NOTICE:
      - Never share this OTP with anyone
      - Our team will never ask for your OTP
      - If you didn't request this, please ignore this email
      
      © 2025 udin.in. All rights reserved.
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
    subject: "Email Verification OTP - udin.in",
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
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Email Verification - udin.in
      
      Hello ${firstName || 'User'},
      
      Please verify your email address to complete your account setup.
      
      Your Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      Enter this code in the verification form to activate your account.
      
      If you didn't create this account, please ignore this email.
      
      © 2025 udin.in. All rights reserved.
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
    processing: { title: "Document Processing", color: "#f59e0b", icon: "🔄" },
    signed: { title: "Document Signed", color: "#7c3aed", icon: "✍️" },
    completed: { title: "Document Completed", color: "#059669", icon: "✅" },
    rejected: { title: "Document Rejected", color: "#dc2626", icon: "❌" },
    failed: { title: "Document Failed", color: "#dc2626", icon: "⚠️" }
  };

  const statusInfo = statusMessages[status] || statusMessages.pending;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${statusInfo.title} - ${documentType} | udin.in`,
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

            ${status === 'completed' ? `
              <div style="background: #f0fdf4; border: 1px solid #059669; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>🎉 Great news!</strong> Your document has been completed successfully!</p>
              </div>
            ` : ''}

            ${status === 'rejected' ? `
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>📋 Action Required:</strong> Your document needs attention. Please review and resubmit with the necessary corrections.</p>
              </div>
            ` : ''}

            ${status === 'failed' ? `
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>❌ Processing Failed:</strong> There was an issue processing your document. Please contact our support team for assistance.</p>
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
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Document Status Update - udin.in
      
      Hello ${firstName || 'User'},
      
      We're writing to update you on the status of your document submission.
      
      Document Details:
      - Document Type: ${documentType}
      - Transaction ID: ${transactionId}
      - New Status: ${status.toUpperCase()}
      - Updated: ${new Date().toLocaleString()}
      
      ${status === 'completed' ? 'Great news! Your document has been completed successfully!' : ''}
      ${status === 'rejected' ? 'Action Required: Your document needs attention. Please review and resubmit with corrections.' : ''}
      ${status === 'failed' ? 'Processing Failed: There was an issue processing your document. Please contact support.' : ''}
      ${status === 'signed' ? 'Complete! Your document has been successfully signed and processed.' : ''}
      
      You can log in to your account to view more details.
      
      If you have any questions, please contact our support team.
      
      © 2025 udin.in. All rights reserved.
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
    subject: "Password Reset Successful - udin.in",
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
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Successful - udin.in
      
      Hello ${firstName || 'User'},
      
      Your password has been successfully reset.
      You can now log in to your account using your new password.
      
      If you didn't make this change, please contact our support team immediately.
      
      For security reasons, we recommend using a strong, unique password.
      
      © 2025 udin.in. All rights reserved.
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

/**
 * Send document note notification email
 */
export async function sendDocumentNoteEmail({ 
  email, 
  firstName, 
  documentType, 
  transactionId, 
  noteText, 
  noteAuthor, 
  noteType, 
  priority, 
  isInternal,
  recipientRole 
}) {
  const priorityInfo = {
    low: { color: "#6b7280", icon: "📝", label: "Low Priority" },
    medium: { color: "#f59e0b", icon: "📋", label: "Medium Priority" },
    high: { color: "#dc2626", icon: "⚠️", label: "High Priority" },
    urgent: { color: "#7c2d12", icon: "🚨", label: "URGENT" }
  };

  const typeInfo = {
    user: { label: "User Note", color: "#059669" },
    admin: { label: "Admin Note", color: "#7c3aed" },
    system: { label: "System Note", color: "#6b7280" }
  };

  const currentPriority = priorityInfo[priority] || priorityInfo.medium;
  const currentType = typeInfo[noteType] || typeInfo.user;

  const subject = `${currentPriority.icon} New ${currentType.label} - ${documentType} | udin.in`;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Document Note</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${currentType.color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .note-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${currentType.color}; }
          .priority-badge { 
            display: inline-block; 
            background: ${currentPriority.color}; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 12px; 
            font-size: 12px; 
            font-weight: bold; 
            margin: 5px 0;
          }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .note-content { 
            background: #ffffff; 
            border: 1px solid #e5e7eb; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 15px 0;
            font-style: italic;
          }
          ${isInternal ? '.internal-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }' : ''}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${currentPriority.icon} New Document Note</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'User'},</h2>
            <p>A new note has been added to one of your documents.</p>
            
            <div class="note-box">
              <div class="details">
                <p><strong>Document Type:</strong> ${documentType}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Note Author:</strong> ${noteAuthor}</p>
                <p><strong>Note Type:</strong> <span style="color: ${currentType.color}; font-weight: bold;">${currentType.label}</span></p>
                <p><strong>Priority:</strong> <span class="priority-badge">${currentPriority.label}</span></p>
                <p><strong>Added:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div class="note-content">
                <strong>Note:</strong><br>
                ${noteText.replace(/\n/g, '<br>')}
              </div>
            </div>

            ${isInternal ? `
              <div class="internal-notice">
                <strong>🔒 Internal Note:</strong> This note is marked as internal and may contain sensitive information.
              </div>
            ` : ''}

            ${priority === 'urgent' || priority === 'high' ? `
              <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>${currentPriority.icon} ${currentPriority.label}:</strong> This note requires your immediate attention.
              </div>
            ` : ''}

            <p>You can log in to your account to view all notes and respond if necessary.</p>
            
            <div class="footer">
              <p>This notification was sent because you are ${recipientRole === 'admin' ? 'an administrator' : 'the document owner'}.</p>
              <p>&copy; 2025 udin.in. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Document Note - udin.in
      
      Hello ${firstName || 'User'},
      
      A new note has been added to one of your documents.
      
      Document Details:
      - Document Type: ${documentType}
      - Transaction ID: ${transactionId}
      - Note Author: ${noteAuthor}
      - Note Type: ${currentType.label}
      - Priority: ${currentPriority.label}
      - Added: ${new Date().toLocaleString()}
      
      Note:
      ${noteText}
      
      ${isInternal ? 'This is an internal note and may contain sensitive information.' : ''}
      ${priority === 'urgent' || priority === 'high' ? `${currentPriority.label}: This note requires your immediate attention.` : ''}
      
      You can log in to your account to view all notes and respond if necessary.
      
      This notification was sent because you are ${recipientRole === 'admin' ? 'an administrator' : 'the document owner'}.
      
      © 2025 udin.in. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Document note email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending document note email:', error);
    throw new Error('Failed to send note notification email');
  }
}