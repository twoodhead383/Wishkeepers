import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationResult, ConfidentialClientApplication } from '@azure/msal-node';
import * as fs from 'fs';
import * as path from 'path';

// Cache logo to avoid repeated disk reads on high-volume sends
let cachedLogoBase64: string | null = null;

// Load and cache the logo as base64
function getLogoBase64(): string {
  if (cachedLogoBase64) {
    return cachedLogoBase64;
  }
  
  try {
    const logoPath = path.join(process.cwd(), 'attached_assets', 'wishkeepers-logo-1024x300_1755001701704.png');
    const logoBuffer = fs.readFileSync(logoPath);
    cachedLogoBase64 = logoBuffer.toString('base64');
    console.log('✅ Logo loaded and cached for email attachments');
    return cachedLogoBase64;
  } catch (error) {
    console.error('❌ Failed to load logo for emails:', error);
    return '';
  }
}

// Helper function to generate email logo header using CID reference
// CID (Content-ID) references work universally across all email clients,
// including mobile Gmail, unlike base64 data URIs which are often blocked
function getEmailLogoHeader(): string {
  return `
    <div style="text-align: center; padding: 30px 0 20px 0;">
      <img src="cid:wishkeepers-logo" alt="Wishkeepers" style="height: 40px; width: auto; display: inline-block;" />
    </div>
  `;
}

// Microsoft Graph authentication configuration
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// Microsoft Graph client with app-only authentication
async function getGraphClient(): Promise<Client> {
  try {
    console.log('🔐 Acquiring Microsoft Graph access token...');
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    // Use client credentials flow for app-only authentication
    const authResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    if (!authResponse || !authResponse.accessToken) {
      throw new Error('Failed to acquire access token from Microsoft Graph');
    }
    
    console.log('✅ Access token acquired successfully');
    console.log('   Token type:', authResponse.tokenType);
    console.log('   Expires in:', authResponse.expiresOn);
    console.log('   Scopes:', authResponse.scopes?.join(', ') || 'No scopes returned');
    
    return Client.init({
      authProvider: (done) => {
        done(null, authResponse.accessToken);
      }
    });
  } catch (error) {
    console.error('❌ Error getting Graph client:', error);
    
    // Enhanced error logging for troubleshooting
    if (error && typeof error === 'object') {
      if ('errorCode' in error) {
        console.error('   Error Code:', (error as any).errorCode);
      }
      if ('errorMessage' in error) {
        console.error('   Error Message:', (error as any).errorMessage);  
      }
      if ('subError' in error) {
        console.error('   Sub Error:', (error as any).subError);
      }
    }
    
    throw error;
  }
}

// Send email using Microsoft Graph API
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  try {
    console.log('🚀 Starting email send process');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    
    // Check environment variables first
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    
    console.log('🔑 Microsoft Graph Configuration:');
    console.log('   Tenant ID:', tenantId ? `${tenantId.substring(0, 8)}...` : 'MISSING');
    console.log('   Client ID:', clientId ? `${clientId.substring(0, 8)}...` : 'MISSING');
    console.log('   Client Secret:', clientSecret ? '[PRESENT]' : 'MISSING');
    
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Missing required Microsoft Graph environment variables');
    }
    
    const graphClient = await getGraphClient();
    console.log('✅ Microsoft Graph client obtained successfully');
    
    // For application permissions, we need to get a specific user from the organization
    // Always use hello@wishkeepers.com for consistent DKIM signing
    console.log('👥 Looking up specific sender user: hello@wishkeepers.com');
    const fromUser = await graphClient.api('/users/hello@wishkeepers.com').get();
    
    if (!fromUser) {
      throw new Error('Sender user hello@wishkeepers.com not found in organization');
    }
    
    console.log('✅ Found sender user:', fromUser.userPrincipalName);
    console.log('   Sender User ID:', fromUser.id);
    
    // Get cached logo for inline attachment
    const logoBase64 = getLogoBase64();
    
    const sendMail = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: htmlContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ],
        from: {
          emailAddress: {
            address: fromUser.userPrincipalName,
            name: 'Wishkeepers'
          }
        },
        attachments: logoBase64 ? [
          {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: 'wishkeepers-logo.png',
            contentType: 'image/png',
            contentBytes: logoBase64,
            contentId: 'wishkeepers-logo',
            isInline: true
          }
        ] : []
      },
      saveToSentItems: true
    };

    // Send email using a valid user from the tenant
    console.log('📤 Sending email via Microsoft Graph API...');
    console.log('   From User ID:', fromUser.id);
    console.log('   From User Email:', fromUser.userPrincipalName);
    console.log('   To:', to);
    console.log('   Subject:', subject);
    
    const response = await graphClient.api(`/users/${fromUser.id}/sendMail`).post(sendMail);
    
    console.log('✅ Microsoft Graph API Response:', response);
    console.log('✅ Email sent successfully via Microsoft Graph to:', to, 'from:', fromUser.userPrincipalName);
  } catch (error) {
    console.error('Error sending email via Microsoft Graph:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function sendTrustedContactInvite(
  email: string, 
  name: string, 
  inviterName: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/trusted-contact/accept/${inviteToken}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${getEmailLogoHeader()}
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
  `;

  try {
    await sendEmail(
      email,
      `${inviterName} has nominated you as a trusted contact on Wishkeepers`,
      htmlContent
    );
    console.log('✅ Invite email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Failed to send invite email via Microsoft Graph:', error);
    
    // For now, log the invitation details for manual follow-up
    console.log('📧 INVITATION DETAILS (for manual sending):');
    console.log(`   To: ${email}`);
    console.log(`   Contact: ${name}`);
    console.log(`   Invited by: ${inviterName}`);
    console.log(`   Invitation URL: ${inviteUrl}`);
    console.log('   Note: Configure Microsoft Graph permissions (Mail.Send, User.Read.All) and grant admin consent');
    
    // Don't throw error - invitation was created successfully, just email failed
    console.log('⚠️  Invitation created but email not sent. Microsoft Graph permissions needed.');
  }
}

export async function sendWelcomeEmail(email: string, firstName: string, lastName: string) {
  const dashboardUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/dashboard`;
  
  const htmlContent = `
    <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      ${getEmailLogoHeader()}
      <!-- Header with branding -->
      <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
          Welcome to Wishkeepers
        </h1>
        <p style="color: #e8f4ff; margin: 8px 0 0; font-size: 16px; opacity: 0.9;">
          Your Digital Legacy Vault
        </p>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">
          Hello ${firstName}! 👋
        </h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px; font-size: 16px;">
          Thank you for joining Wishkeepers. You've taken an important step in preparing for life's most significant moments and ensuring your loved ones have access to the information they need when it matters most.
        </p>
        
        <!-- Feature highlights -->
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #2563eb; margin: 0 0 16px; font-size: 18px; font-weight: 600;">
            What you can do with Wishkeepers:
          </h3>
          <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>🔒 Store Legacy Information</strong> - Securely save funeral wishes, insurance details, and banking information</li>
            <li style="margin-bottom: 8px;"><strong>👥 Nominate Trusted Contacts</strong> - Choose people who can access your information when needed</li>
            <li style="margin-bottom: 8px;"><strong>💝 Personal Messages</strong> - Leave heartfelt messages for your loved ones</li>
            <li style="margin-bottom: 0;"><strong>🛡️ Bank-Level Security</strong> - Your data is encrypted with AES-256 encryption</li>
          </ul>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 24px 0; font-size: 16px;">
          Ready to get started? Your vault is waiting for you, and it only takes a few minutes to set up the essentials.
        </p>
        
        <!-- Call to action button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.2s ease;">
            Set Up Your Vault
          </a>
        </div>
        
        <!-- Additional info -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 16px; font-size: 14px;">
            <strong>Need help?</strong> Our support team is here to assist you every step of the way. Simply reply to this email or contact us through your dashboard.
          </p>
          <p style="color: #6b7280; line-height: 1.6; margin: 0; font-size: 14px;">
            Thank you for trusting Wishkeepers with your digital legacy.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          Best regards,<br>
          <strong style="color: #2563eb;">The Wishkeepers Team</strong>
        </p>
        <p style="color: #9ca3af; margin: 16px 0 0; font-size: 12px;">
          This email was sent to ${email}. You received this because you created a Wishkeepers account.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail(
      email,
      `Welcome to Wishkeepers, ${firstName}! Your digital legacy vault awaits`,
      htmlContent
    );
    console.log('✅ Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email via Microsoft Graph:', error);
    
    // Log welcome details for manual follow-up
    console.log('📧 WELCOME EMAIL DETAILS (for manual sending):');
    console.log(`   To: ${email}`);
    console.log(`   User: ${firstName} ${lastName}`);
    console.log(`   Dashboard URL: ${dashboardUrl}`);
    console.log('   Note: Configure Microsoft Graph permissions if needed');
    
    // Don't throw error - registration was successful, just email failed
    console.log('⚠️  User registered successfully but welcome email not sent.');
  }
}

export async function sendVaultCompletionReminder(email: string, firstName: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${getEmailLogoHeader()}
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
  `;

  try {
    await sendEmail(
      email,
      'Gentle reminder: Complete your Wishkeepers vault',
      htmlContent
    );
    console.log('Reminder email sent to:', email);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}

export async function sendVerificationCode(email: string, firstName: string, verificationCode: string) {
  const htmlContent = `
    <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      ${getEmailLogoHeader()}
      <!-- Header with branding -->
      <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
          Verify Your Email
        </h1>
        <p style="color: #e8f4ff; margin: 8px 0 0; font-size: 16px; opacity: 0.9;">
          Wishkeepers Account Verification
        </p>
      </div>
      
      <!-- Main content -->
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">
          Hello ${firstName}! 👋
        </h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px; font-size: 16px;">
          Thank you for signing up with Wishkeepers. To complete your registration, please verify your email address by entering the code below:
        </p>
        
        <!-- Verification code display -->
        <div style="background-color: #f8fafc; border: 2px dashed #2563eb; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: #6b7280; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            Your Verification Code
          </p>
          <div style="background-color: #ffffff; border-radius: 6px; padding: 20px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 8px;">
              ${verificationCode}
            </span>
          </div>
          <p style="color: #6b7280; margin: 12px 0 0; font-size: 14px;">
            This code expires in 15 minutes
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 24px 0; font-size: 16px;">
          If you didn't create a Wishkeepers account, you can safely ignore this email.
        </p>
        
        <!-- Additional info -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 16px; font-size: 14px;">
            <strong>Security tip:</strong> Never share this verification code with anyone. Wishkeepers staff will never ask for this code.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          Best regards,<br>
          <strong style="color: #2563eb;">The Wishkeepers Team</strong>
        </p>
        <p style="color: #9ca3af; margin: 16px 0 0; font-size: 12px;">
          This email was sent to ${email}. You received this because you created a Wishkeepers account.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail(
      email,
      `Your Wishkeepers verification code: ${verificationCode}`,
      htmlContent
    );
    console.log('✅ Verification email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    
    // Log verification details for manual follow-up
    console.log('📧 VERIFICATION EMAIL DETAILS (for manual sending):');
    console.log(`   To: ${email}`);
    console.log(`   User: ${firstName}`);
    console.log(`   Verification Code: ${verificationCode}`);
    console.log('   Note: Configure Microsoft Graph permissions if needed');
    
    // Don't throw error - we'll handle this in the route
    throw error;
  }
}

export async function sendRemovalNotification(email: string, recipientName: string, otherPersonName: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      ${getEmailLogoHeader()}
      <!-- Header -->
      <div style="background-color: #f59e0b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
          Trusted Contact Removal Notice
        </h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">
          Hello ${recipientName},
        </h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px; font-size: 16px;">
          This is to notify you that <strong>${otherPersonName}</strong> has requested to be removed as a trusted contact.
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #78350f; margin: 0; font-size: 14px;">
            <strong>What this means:</strong> ${otherPersonName} will no longer have access to request your vault information. You may want to nominate another trusted contact to ensure your wishes are properly executed.
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0; font-size: 16px;">
          If you have any questions or concerns, please don't hesitate to contact our support team.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          Best regards,<br>
          <strong style="color: #2563eb;">The Wishkeepers Team</strong>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail(
      email,
      'Trusted Contact Removal Notification - Wishkeepers',
      htmlContent
    );
    console.log('✅ Removal notification sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send removal notification:', error);
    throw error;
  }
}

export async function sendProspectInvitation(email: string, firstName: string) {
  const registerUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/register`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333;">
      ${getEmailLogoHeader()}
      <!-- Header -->
      <div style="background-color: #2563eb; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
          You're Invited to Wishkeepers
        </h1>
      </div>
      
      <!-- Main content -->
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">
          Hello ${firstName},
        </h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px; font-size: 16px;">
          We're excited to invite you to join <strong>Wishkeepers</strong>, a secure digital vault where you can preserve your final wishes, important information, and heartfelt messages for those who matter most.
        </p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #1e40af; margin: 0 0 12px; font-size: 16px;">What you can do with Wishkeepers:</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Securely store your funeral wishes and preferences</li>
            <li>Keep important insurance and banking details in one encrypted place</li>
            <li>Write personal messages to loved ones</li>
            <li>Nominate trusted contacts who can access this information when needed</li>
            <li>Gain peace of mind knowing your wishes will be honored</li>
          </ul>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 24px; font-size: 16px;">
          Your information is protected with military-grade encryption, ensuring that only you and your designated trusted contacts can ever access your vault.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${registerUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
            Create Your Vault
          </a>
        </div>
        
        <p style="color: #6b7280; line-height: 1.6; margin: 20px 0 0; font-size: 14px; text-align: center;">
          Questions? We're here to help. Simply reply to this email or contact our support team.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          Welcome to the Wishkeepers family,<br>
          <strong style="color: #2563eb;">The Wishkeepers Team</strong>
        </p>
        <p style="color: #9ca3af; margin: 8px 0 0; font-size: 12px;">
          Preserving legacies, honoring wishes
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail(
      email,
      'Your Invitation to Wishkeepers - Secure Your Legacy',
      htmlContent
    );
    console.log('✅ Prospect invitation sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send prospect invitation:', error);
    throw error;
  }
}