import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

export async function sendTrustedContactInvite(
  email: string, 
  name: string, 
  inviterName: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/trusted-contact/accept/${inviteToken}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@wishkeepers.com',
    to: email,
    subject: `${inviterName} has nominated you as a trusted contact on Wishkeepers`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You've been nominated as a trusted contact</h2>
        <p>Hello ${name},</p>
        <p>${inviterName} has nominated you as a trusted contact on Wishkeepers, a secure digital legacy vault.</p>
        <p>This means that if needed, you may be able to access important information they've stored for their loved ones.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Wishkeepers Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invite email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVaultCompletionReminder(email: string, firstName: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@wishkeepers.com',
    to: email,
    subject: 'Gentle reminder: Complete your Wishkeepers vault',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your vault is waiting for you</h2>
        <p>Hello ${firstName},</p>
        <p>We noticed your Wishkeepers vault isn't quite complete yet. Taking a few minutes to finish it now can provide tremendous peace of mind for you and your loved ones.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BASE_URL || 'http://localhost:5000'}/vault" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Your Vault
          </a>
        </div>
        <p>Best regards,<br>The Wishkeepers Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent to:', email);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}
