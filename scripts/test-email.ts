import { sendEmail } from '../src/lib/emails';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function test() {
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('Please provide a test email address: tsx scripts/test-email.ts user@example.com');
    process.exit(1);
  }

  console.log(`Sending test email to ${testEmail}...`);
  
  const result = await sendEmail({
    to: testEmail,
    subject: 'test: welcome to the onseek network.',
    templateName: 'partner_welcome.html',
    placeholders: {}
  });

  if (result.success) {
    console.log('✅ Email sent successfully!', result.data);
  } else {
    console.error('❌ Failed to send email:', result.error);
  }
}

test();
