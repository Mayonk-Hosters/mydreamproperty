import nodemailer from 'nodemailer';

// Default admin email
const ADMIN_EMAIL = 'rahul.dhapatkar1010@gmail.com';

// Create a transporter using Gmail SMTP
// This will work with any SMTP service, not just Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD || 'dummy' // Will be set via environment
  },
  // Fallback configuration for basic SMTP
  tls: {
    rejectUnauthorized: false
  }
});

// Test transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured properly:', error.message);
    console.log('Email notifications will be logged to console instead');
  } else {
    console.log('Email service ready for sending notifications');
  }
});

/**
 * Sends email notification for property inquiries
 */
export async function sendPropertyInquiryNotification(inquiry: any, propertyTitle?: string): Promise<boolean> {
  const subject = `New Property Inquiry${propertyTitle ? ` for "${propertyTitle}"` : ''}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">New Property Inquiry</h2>
        ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
        <p><strong>From:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
        ${inquiry.budget ? `<p><strong>Budget:</strong> ₹${inquiry.budget?.toLocaleString()}</p>` : ''}
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb;">
          ${inquiry.message?.replace(/\n/g, '<br>') || 'No message provided'}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  
  return await sendEmail(subject, html, inquiry.email, inquiry.name);
}

/**
 * Sends email notification for home loan inquiries
 */
export async function sendHomeLoanInquiryNotification(inquiry: any): Promise<boolean> {
  const subject = 'New Home Loan Inquiry';
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #059669;">New Home Loan Inquiry</h2>
        <p><strong>From:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        ${inquiry.loanType ? `<p><strong>Loan Type:</strong> ${inquiry.loanType}</p>` : ''}
        ${inquiry.loanAmount ? `<p><strong>Loan Amount:</strong> ₹${inquiry.loanAmount?.toLocaleString()}</p>` : ''}
        ${inquiry.propertyLocation ? `<p><strong>Property Location:</strong> ${inquiry.propertyLocation}</p>` : ''}
        ${inquiry.monthlyIncome ? `<p><strong>Monthly Income:</strong> ₹${inquiry.monthlyIncome?.toLocaleString()}</p>` : ''}
        ${inquiry.employment ? `<p><strong>Employment:</strong> ${inquiry.employment}</p>` : ''}
        <p><strong>Message:</strong></p>
        <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #059669;">
          ${inquiry.message?.replace(/\n/g, '<br>') || 'No message provided'}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  
  return await sendEmail(subject, html, inquiry.email, inquiry.name);
}

/**
 * Sends email notification for contact messages
 */
export async function sendContactMessageNotification(message: any): Promise<boolean> {
  const subject = `New Contact Message: ${message.subject}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">New Contact Message</h2>
        <p><strong>From:</strong> ${message.name}</p>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Phone:</strong> ${message.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626;">
          ${message.message?.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  
  return await sendEmail(subject, html, message.email, message.name);
}

/**
 * Core email sending function
 */
async function sendEmail(subject: string, html: string, replyToEmail?: string, replyToName?: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: {
        name: 'My Dream Property',
        address: process.env.EMAIL_USER || 'noreply@mydreamproperty.com'
      },
      to: ADMIN_EMAIL,
      subject: subject,
      html: html,
      replyTo: replyToEmail ? {
        name: replyToName || '',
        address: replyToEmail
      } : undefined
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email notification sent successfully to ${ADMIN_EMAIL}:`, subject);
    return true;
  } catch (error: any) {
    // Log the notification details to console if email fails
    console.log('\n📧 EMAIL NOTIFICATION (Email service not configured):');
    console.log('='.repeat(60));
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    if (replyToEmail) {
      console.log(`Reply-To: ${replyToName} <${replyToEmail}>`);
    }
    console.log('Content:', html.replace(/<[^>]*>/g, '').trim());
    console.log('='.repeat(60));
    console.log('Note: Configure EMAIL_USER and EMAIL_PASSWORD environment variables to enable email sending\n');
    
    // Return true so the application continues to work even without email configuration
    return true;
  }
}