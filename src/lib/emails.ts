import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: 'request_published.html' | 'proposal_received.html' | 'partner_welcome.html';
  placeholders: Record<string, string>;
}

export async function sendEmail({ to, subject, templateName, placeholders }: SendEmailOptions) {
  try {
    const templatePath = path.join(process.cwd(), 'src/emails/templates', templateName);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders like [category], [budget], etc.
    Object.entries(placeholders).forEach(([key, value]) => {
      // Use a regex to replace all instances of [key]
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      htmlContent = htmlContent.replace(regex, value);
    });

    const { data, error } = await resend.emails.send({
      from: 'onseek <noreply@onseek.co>', // User can change this once domain is verified
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Fatal error in sendEmail:', error);
    return { success: false, error };
  }
}

/**
 * Convenience function for 'Request Published' email
 */
export async function sendRequestPublishedEmail(to: string, data: { category: string; budget: string; timeline: string }) {
  return sendEmail({
    to,
    subject: 'Your request is live on Onseek',
    templateName: 'request_published.html',
    placeholders: {
      category: data.category,
      budget: data.budget,
      timeline: data.timeline,
    },
  });
}

/**
 * Convenience function for 'Proposal Received' email
 */
export async function sendProposalReceivedEmail(to: string, data: { price: string; url: string }) {
  return sendEmail({
    to,
    subject: 'New proposal for your request',
    templateName: 'proposal_received.html',
    placeholders: {
      price: data.price,
      url: data.url,
    },
  });
}

/**
 * Convenience function for 'Partner Welcome' email
 */
export async function sendPartnerWelcomeEmail(to: string) {
  return sendEmail({
    to,
    subject: 'Welcome to the Onseek network',
    templateName: 'partner_welcome.html',
    placeholders: {},
  });
}
