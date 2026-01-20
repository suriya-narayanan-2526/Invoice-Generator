import { Resend } from 'resend';

let resendClient = null;

const getResendClient = () => {
  const mode = (process.env.EMAIL_MODE || '').trim();
  if (!resendClient && mode === 'resend') {
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is missing or empty');
      return null;
    }
    resendClient = new Resend(apiKey);
    console.log('✅ Resend client initialized');
  }
  return resendClient;
};

export async function sendEmail({ to, subject, html, text }) {
  const emailMode = (process.env.EMAIL_MODE || 'console').trim();
  const client = getResendClient();

  if (emailMode === 'resend' && client) {
    console.log('📡 Calling Resend API...');
    try {
      const { data, error } = await client.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, '')
      });

      console.log('📡 Resend API call completed. Data:', !!data, 'Error:', !!error);

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Failed to send email via Resend:', error);
      throw error;
    }
  } else {
    // Console mode (development)
    console.log('\n📧 EMAIL SENT (Console Mode):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('---');
    console.log(text || html.replace(/<[^>]*>/g, ''));
    console.log('---\n');
    return { success: true, messageId: 'console-mode' };
  }
}

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Invoice Generator!</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Invoice Generator!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Invoice Generator',
    html,
    text
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password

We received a request to reset your password. Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Invoice Generator',
    html,
    text
  });
}

export async function sendInvoiceEmail(to, invoiceData, pdfBuffer) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice from ${invoiceData.businessName}</h1>
        </div>
        <div class="content">
          <p>Hi ${invoiceData.clientName},</p>
          <p>Please find attached invoice <strong>${invoiceData.invoiceNumber}</strong>.</p>
          <p><strong>Amount:</strong> ₹${invoiceData.total.toLocaleString('en-IN')}</p>
          <p><strong>Due Date:</strong> ${invoiceData.dueDate}</p>
          <p>Thank you for your business!</p>
        </div>
        <div class="footer">
          <p>This is an automated email from Invoice Generator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Invoice from ${invoiceData.businessName}

Hi ${invoiceData.clientName},

Please find attached invoice ${invoiceData.invoiceNumber}.

Amount: ₹${invoiceData.total.toLocaleString('en-IN')}
Due Date: ${invoiceData.dueDate}

Thank you for your business!
  `;

  // Note: PDF attachment not implemented in console mode
  return sendEmail({
    to,
    subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.businessName}`,
    html,
    text
  });
}
