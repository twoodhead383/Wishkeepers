import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationResult, ConfidentialClientApplication } from '@azure/msal-node';

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
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    // Use client credentials flow for app-only authentication
    const authResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    if (!authResponse || !authResponse.accessToken) {
      throw new Error('Failed to acquire access token from Microsoft Graph');
    }
    
    return Client.init({
      authProvider: (done) => {
        done(null, authResponse.accessToken);
      }
    });
  } catch (error) {
    console.error('Error getting Graph client:', error);
    throw error;
  }
}

// Send email using Microsoft Graph API
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  try {
    const graphClient = await getGraphClient();
    
    // For application permissions, we need to get a valid user from the organization
    // First, try to get the first available user from the organization
    const users = await graphClient.api('/users').top(1).get();
    
    if (!users || !users.value || users.value.length === 0) {
      throw new Error('No users found in the organization to send email from');
    }
    
    const fromUser = users.value[0];
    console.log('Sending email from user:', fromUser.userPrincipalName);
    
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
        }
      },
      saveToSentItems: true
    };

    // Send email using a valid user from the tenant
    await graphClient.api(`/users/${fromUser.id}/sendMail`).post(sendMail);
    
    console.log('Email sent successfully via Microsoft Graph to:', to, 'from:', fromUser.userPrincipalName);
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

export async function sendVaultCompletionReminder(email: string, firstName: string) {
  const htmlContent = `
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