import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log("⚠️ Email not configured - Using development mode");
    // Return mock transporter for development
    return {
      sendMail: async (mailOptions) => {
        console.log("\n========================================");
        console.log("📧 EMAIL (Development Mode - Not Sent)");
        console.log("========================================");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        const urlMatch = mailOptions.html.match(
          /href="([^"]+reset-password[^"]+)"/
        );
        if (urlMatch) {
          console.log("Reset URL:", urlMatch[1]);
        }
        console.log("========================================\n");
        return { messageId: "dev-" + Date.now() };
      },
    };
  }

  // Production transporter with Gmail
  console.log("✅ Email configured - Using Gmail SMTP");
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // For development/testing
    },
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Gmail SMTP connection failed:", error.message);
    } else {
      console.log("✅ Gmail SMTP connection successful - Ready to send emails");
    }
  });

  return transporter;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "NexPosit <noreply@nexposit.com>",
      to: email,
      subject: "Password Reset Request - NexPosit",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              margin: 0 0 16px 0;
              color: #4b5563;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .url-box {
              background: #f9fafb;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #3B82F6;
              word-break: break-all;
              color: #3B82F6;
              font-size: 14px;
              margin: 20px 0;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .warning strong {
              color: #b45309;
            }
            .footer {
              background: #f9fafb;
              padding: 24px 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName || "there"}</strong>,</p>
              
              <p>We received a request to reset your password for your NexPosit account.</p>
              
              <p>Click the button below to create a new password:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="url-box">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
              </div>
              
              <p style="margin-top: 24px;"><strong>Didn't request this?</strong></p>
              <p>You can safely ignore this email. Your password will remain unchanged.</p>
              
              <p style="margin-top: 32px;">Best regards,<br><strong>The NexPosit Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>© 2025 NexPosit</strong></p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${userName || "there"},

We received a request to reset your password for your NexPosit account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this, you can safely ignore this email. Your password will not be changed.

Best regards,
The NexPosit Team

---
© 2025 NexPosit. This is an automated email, please do not reply.
      `,
    };

    console.log(`📧 Sending password reset email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "NexPosit <noreply@nexposit.com>",
      to: email,
      subject: "Welcome to NexPosit! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
            }
            .content {
              padding: 40px 30px;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .features {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .features li {
              margin: 10px 0;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Welcome to NexPosit!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">We're excited to have you, ${userName}!</p>
            </div>
            <div class="content">
              <p>You've successfully created your NexPosit account. Start planning, collaborating, and publishing content with your team today!</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.CLIENT_URL || "http://localhost:5173"
                }/contexts" class="button">Get Started →</a>
              </div>
              
              <div class="features">
                <p><strong>What you can do with NexPosit:</strong></p>
                <ul>
                  <li>📝 Plan your content calendar</li>
                  <li>👥 Collaborate with your team</li>
                  <li>🚀 Schedule posts efficiently</li>
                  <li>📊 Manage multiple projects</li>
                </ul>
              </div>
              
              <p>If you have any questions, our support team is here to help!</p>
              
              <p style="margin-top: 32px;">Best regards,<br><strong>The NexPosit Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`📧 Sending welcome email to: ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully!`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false };
  }
};
