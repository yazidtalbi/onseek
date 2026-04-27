import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: 'request_published.html' | 'proposal_received.html' | 'partner_welcome.html' | 'user_welcome.html';
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
export async function sendRequestPublishedEmail(to: string, data: { title: string; category: string; budget: string; condition: string }) {
  const getConditionLabel = (category: string) => {
    const service = ["Services", "Learning", "Health"];
    const property = ["Property"];
    const digital = ["Digital", "Culture", "Finance"];
    const experience = ["Travel", "Experiences", "Family"];

    if (service.includes(category)) return "Expertise";
    if (property.includes(category)) return "Occupancy";
    if (digital.includes(category)) return "Rights";
    if (experience.includes(category)) return "Tier";
    return "Condition";
  };

  return sendEmail({
    to,
    subject: 'Your request is live on Onseek',
    templateName: 'request_published.html',
    placeholders: {
      title: data.title,
      category: data.category,
      budget: data.budget,
      condition: data.condition,
      conditionLabel: getConditionLabel(data.category),
    },
  });
}

/**
 * Convenience function for 'Proposal Received' email
 */
export async function sendProposalReceivedEmail(to: string, data: { title: string; price: string; url: string }) {
  return sendEmail({
    to,
    subject: 'New proposal for your request',
    templateName: 'proposal_received.html',
    placeholders: {
      title: data.title,
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
/**
 * Convenience function for 'User Welcome' email
 */
export async function sendWelcomeEmail(to: string) {
  return sendEmail({
    to,
    subject: 'Welcome to Onseek: The hunt is on.',
    templateName: 'user_welcome.html',
    placeholders: {},
  });
}
