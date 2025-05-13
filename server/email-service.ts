import SibApiV3Sdk from 'sib-api-v3-sdk';
import { Inquiry } from '@shared/schema';

// Validate required environment variables
if (!process.env.BREVO_API_KEY) {
  console.warn('Warning: BREVO_API_KEY is not set. Email notifications will not be sent.');
}

if (!process.env.ADMIN_EMAIL) {
  console.warn('Warning: ADMIN_EMAIL is not set. Email notifications will not be sent.');
}

// Initialize the Brevo API client
let apiInstance: any = null;

try {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY || '';
  apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
} catch (error) {
  console.error('Failed to initialize Brevo API client:', error);
}

/**
 * Sends an email notification to the admin when a property inquiry is received
 * @param inquiry The inquiry data
 * @param propertyTitle The title of the property being inquired about
 * @returns Promise resolving to true if email was sent successfully, false otherwise
 */
export async function sendInquiryNotification(inquiry: Inquiry, propertyTitle?: string): Promise<boolean> {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set. Cannot send email notification.');
      return false;
    }
    
    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set. Cannot send email notification.');
      return false;
    }

    if (!apiInstance) {
      console.error('Brevo API client is not initialized. Cannot send email notification.');
      return false;
    }

    // Prepare the email content
    const sendSmtpEmail = {
      to: [{ email: process.env.ADMIN_EMAIL }],
      sender: { 
        name: 'My Dream Property', 
        email: 'noreply@mydreamproperty.com'
      },
      replyTo: { email: inquiry.email, name: inquiry.name },
      subject: `New Property Inquiry${propertyTitle ? ` for "${propertyTitle}"` : ''}`,
      htmlContent: `
        <html>
          <body>
            <h1>New Property Inquiry</h1>
            ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
            <p><strong>From:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            <p><strong>Phone:</strong> ${inquiry.phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
            <p>You can respond directly to this email to contact the inquirer.</p>
            <hr>
            <p><small>This is an automated message from My Dream Property website.</small></p>
          </body>
        </html>
      `,
      textContent: `
        New Property Inquiry
        
        ${propertyTitle ? `Property: ${propertyTitle}\n` : ''}
        From: ${inquiry.name}
        Email: ${inquiry.email}
        Phone: ${inquiry.phone || 'Not provided'}
        
        Message:
        ${inquiry.message}
        
        You can respond directly to this email to contact the inquirer.
        
        This is an automated message from My Dream Property website.
      `
    };

    // Send the email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email notification sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}