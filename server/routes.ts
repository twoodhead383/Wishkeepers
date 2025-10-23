import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { hashPassword, comparePassword, requireAuth, requireAdmin } from "./auth";
import { sendTrustedContactInvite } from "./email";
import { handleChatWithAI } from "./chat";
import { z } from "zod";
import { 
  insertUserSchema, 
  loginSchema, 
  insertVaultSchema,
  insertTrustedContactSchema,
  insertDataReleaseRequestSchema,
  insertThirdPartySchema,
  insertInterestedPartySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure we have a session secret
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required for security');
  }

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // CSRF protection
    },
    name: 'wishkeepers_session' // Don't use default session name
  }));

  // Public route for holding page email capture
  app.post('/api/interested-parties', async (req, res) => {
    try {
      const partyData = insertInterestedPartySchema.parse(req.body);
      
      // Check if email already exists
      const existingParties = await storage.listInterestedParties();
      const emailExists = existingParties.some(p => p.email.toLowerCase() === partyData.email.toLowerCase());
      
      if (emailExists) {
        return res.status(409).json({ message: 'This email has already been registered for updates' });
      }
      
      // Create interested party record
      const party = await storage.createInterestedParty(partyData);
      
      res.json({ 
        message: 'Thank you for your interest! We\'ll notify you when Wishkeepers launches.',
        success: true
      });
    } catch (error) {
      console.error('Error registering interested party:', error);
      res.status(400).json({ message: 'Invalid data provided' });
    }
  });

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user (unverified)
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate secure 6-digit verification code using crypto
      const verificationCode = (await import('crypto')).randomInt(100000, 999999).toString();
      
      // Set code expiry to 15 minutes from now
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      // Update user with verification code
      await storage.updateUser(user.id, {
        verificationCode,
        verificationCodeExpiry
      });
      
      // Send verification email
      try {
        const { sendVerificationCode } = await import('./email');
        await sendVerificationCode(user.email, user.firstName, verificationCode);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Return error if verification email fails since it's critical
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again.' 
        });
      }
      
      res.json({ 
        message: 'Registration successful. Please check your email for a verification code.',
        email: user.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  // Verify email with code
  app.post('/api/verify-email', async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      
      if (!user.verificationCode || !user.verificationCodeExpiry) {
        return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
      }
      
      // Check if code expired
      if (new Date() > user.verificationCodeExpiry) {
        return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
      }
      
      // Check if code matches
      if (user.verificationCode !== code) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Verify user and clear verification code
      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null
      });
      
      // Set session to log them in
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin || false;
      
      // Send welcome email
      try {
        const { sendWelcomeEmail } = await import('./email');
        await sendWelcomeEmail(user.email, user.firstName, user.lastName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail verification if welcome email fails
      }
      
      res.json({ 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Verification failed. Please try again.' });
    }
  });

  // Resend verification code
  app.post('/api/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      
      // Check if user recently requested a code (rate limiting)
      if (user.verificationCodeExpiry && user.verificationCodeExpiry > new Date()) {
        const timeLeft = Math.ceil((user.verificationCodeExpiry.getTime() - Date.now()) / 1000 / 60);
        return res.status(429).json({ 
          message: `Please wait ${timeLeft} minute(s) before requesting a new code.` 
        });
      }
      
      // Generate secure 6-digit verification code using crypto
      const verificationCode = (await import('crypto')).randomInt(100000, 999999).toString();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      // Update user with new code
      await storage.updateUser(user.id, {
        verificationCode,
        verificationCodeExpiry
      });
      
      // Send verification email
      try {
        const { sendVerificationCode } = await import('./email');
        await sendVerificationCode(user.email, user.firstName, verificationCode);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again.' 
        });
      }
      
      res.json({ 
        message: 'Verification code sent. Please check your email.'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend code. Please try again.' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if email is verified
      if (!user.emailVerified && !user.isAdmin) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in',
          requiresVerification: true,
          email: user.email
        });
      }
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin || false;
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          isAdmin: user.isAdmin 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          isAdmin: user.isAdmin 
        } 
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // Vault routes
  app.get('/api/vault', requireAuth, async (req, res) => {
    try {
      const vault = await storage.getVaultByUserId(req.session.userId!);
      res.json({ vault });
    } catch (error) {
      console.error('Error fetching vault:', error);
      res.status(500).json({ message: 'Failed to fetch vault data' });
    }
  });

  app.post('/api/vault', requireAuth, async (req, res) => {
    try {
      const vaultData = insertVaultSchema.parse(req.body);
      
      const existingVault = await storage.getVaultByUserId(req.session.userId!);
      if (existingVault) {
        const updated = await storage.updateVault(existingVault.id, vaultData);
        return res.json({ vault: updated });
      }
      
      const vault = await storage.createVault({
        ...vaultData,
        userId: req.session.userId!
      });
      
      res.json({ vault });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  app.put('/api/vault/:id', requireAuth, async (req, res) => {
    try {
      const vaultData = insertVaultSchema.parse(req.body);
      const vault = await storage.updateVault(req.params.id, vaultData);
      
      if (!vault) {
        return res.status(404).json({ message: 'Vault not found' });
      }
      
      res.json({ vault });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  // Get vaults where user is nominated as trusted contact
  app.get('/api/nominated-for', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get all vaults where this user is a trusted contact
      const contacts = await storage.getTrustedContactsByEmail(user.email);
      
      // Get vault and owner details for each
      const nominatedFor = await Promise.all(
        contacts
          .filter(c => c.status === 'confirmed')
          .map(async (contact) => {
            const vault = await storage.getVault(contact.vaultId);
            if (!vault) return null;
            
            const vaultOwner = await storage.getUser(vault.userId);
            if (!vaultOwner) return null;

            return {
              contactId: contact.id,
              vaultId: vault.id,
              ownerName: `${vaultOwner.firstName} ${vaultOwner.lastName}`,
              ownerEmail: vaultOwner.email,
              confirmedAt: contact.confirmedAt
            };
          })
      );

      res.json({ nominatedFor: nominatedFor.filter(n => n !== null) });
    } catch (error) {
      console.error('Error fetching nominated-for list:', error);
      res.status(500).json({ message: 'Failed to fetch nominations', error });
    }
  });

  // Trusted contacts routes
  app.get('/api/trusted-contacts', requireAuth, async (req, res) => {
    const vault = await storage.getVaultByUserId(req.session.userId!);
    if (!vault) {
      return res.json({ contacts: [] });
    }
    
    const contacts = await storage.getTrustedContacts(vault.id);
    res.json({ contacts });
  });

  app.post('/api/trusted-contacts', requireAuth, async (req, res) => {
    try {
      const contactData = insertTrustedContactSchema.parse(req.body);
      
      // Get or create vault for the user
      let vault = await storage.getVaultByUserId(req.session.userId!);
      if (!vault) {
        // Create an empty vault for the user so they can add trusted contacts
        vault = await storage.createVault({
          userId: req.session.userId!,
          funeralWishes: undefined,
          funeralData: undefined,
          lifeInsurance: undefined,
          banking: undefined,
          personalMessages: undefined,
          specialRequests: undefined,
        });
      }
      
      const contact = await storage.createTrustedContact({
        ...contactData,
        vaultId: vault.id
      });
      
      // Send invitation email
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        try {
          await sendTrustedContactInvite(
            contact.contactEmail,
            contact.contactName,
            `${user.firstName} ${user.lastName}`,
            contact.inviteToken!
          );
        } catch (emailError) {
          console.error('Failed to send invite email:', emailError);
        }
      }
      
      res.json({ contact });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  // Get invite details by token (public route for accepting invites)
  app.get('/api/trusted-contacts/invite/:token', async (req, res) => {
    try {
      const contact = await storage.getTrustedContactByToken(req.params.token);
      if (!contact) {
        return res.status(404).json({ message: 'Invalid invite token' });
      }

      // Get the vault owner's name
      const vault = await storage.getVault(contact.vaultId);
      if (!vault) {
        return res.status(404).json({ message: 'Vault not found' });
      }

      const vaultOwner = await storage.getUser(vault.userId);
      if (!vaultOwner) {
        return res.status(404).json({ message: 'Vault owner not found' });
      }

      res.json({
        contactEmail: contact.contactEmail,
        contactName: contact.contactName,
        inviterName: `${vaultOwner.firstName} ${vaultOwner.lastName}`
      });
    } catch (error) {
      console.error('Error fetching invite details:', error);
      res.status(500).json({ message: 'Failed to fetch invite details' });
    }
  });

  app.post('/api/trusted-contacts/:token/accept', async (req, res) => {
    try {
      const contact = await storage.getTrustedContactByToken(req.params.token);
      if (!contact) {
        return res.status(404).json({ message: 'Invalid invite token' });
      }

      const { password } = req.body;
      
      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' 
        });
      }

      // Check if user already exists with this email
      let user = await storage.getUserByEmail(contact.contactEmail);
      
      if (!user) {
        // Create new user account (no email verification needed - they came from email invite)
        const hashedPassword = await hashPassword(password);
        
        user = await storage.createUser({
          email: contact.contactEmail,
          password: hashedPassword,
          firstName: contact.contactName.split(' ')[0] || contact.contactName,
          lastName: contact.contactName.split(' ').slice(1).join(' ') || '',
          emailVerified: true, // Auto-verified since they came from email invite
        });
      }

      // Update contact status to confirmed
      await storage.updateTrustedContact(contact.id, {
        status: 'confirmed',
        confirmedAt: new Date()
      });

      // Create session for the user
      req.session.userId = user.id;
      req.session.save();

      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Error accepting invite:', error);
      res.status(500).json({ message: 'Failed to accept invitation' });
    }
  });

  // Remove as trusted contact
  app.post('/api/trusted-contacts/:id/remove', requireAuth, async (req, res) => {
    try {
      const contactId = req.params.id;
      
      // Get the trusted contact
      const contact = await storage.getTrustedContact(contactId);
      if (!contact) {
        return res.status(404).json({ message: 'Trusted contact not found' });
      }

      // Verify the user is the contact
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.email !== contact.contactEmail) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Get vault owner details for email notification
      const vault = await storage.getVault(contact.vaultId);
      if (!vault) {
        return res.status(404).json({ message: 'Vault not found' });
      }

      const vaultOwner = await storage.getUser(vault.userId);
      if (!vaultOwner) {
        return res.status(404).json({ message: 'Vault owner not found' });
      }

      // Update contact status to denied
      await storage.updateTrustedContact(contactId, {
        status: 'denied'
      });

      // Send emails to both parties
      const { sendRemovalNotification } = await import('./email');
      try {
        await sendRemovalNotification(
          vaultOwner.email,
          `${vaultOwner.firstName} ${vaultOwner.lastName}`,
          contact.contactName
        );
        await sendRemovalNotification(
          contact.contactEmail,
          contact.contactName,
          `${vaultOwner.firstName} ${vaultOwner.lastName}`
        );
      } catch (emailError) {
        console.error('Failed to send removal notification:', emailError);
      }

      res.json({ message: 'Removal request sent successfully' });
    } catch (error) {
      console.error('Error removing trusted contact:', error);
      res.status(500).json({ message: 'Failed to remove trusted contact' });
    }
  });

  // Resend trusted contact invitation
  app.post('/api/trusted-contacts/:id/resend', requireAuth, async (req, res) => {
    try {
      const contactId = req.params.id;
      
      // Get the trusted contact
      const contact = await storage.getTrustedContact(contactId);
      if (!contact) {
        return res.status(404).json({ message: 'Trusted contact not found' });
      }
      
      // Verify the contact belongs to the current user's vault
      const vault = await storage.getVaultByUserId(req.session.userId!);
      if (!vault || contact.vaultId !== vault.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Only resend for pending contacts
      if (contact.status !== 'pending') {
        return res.status(400).json({ message: 'Can only resend invitations for pending contacts' });
      }
      
      // Get user info for the email
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        try {
          const { sendTrustedContactInvite } = await import('./email');
          await sendTrustedContactInvite(
            contact.contactEmail,
            contact.contactName,
            `${user.firstName} ${user.lastName}`,
            contact.inviteToken!
          );
          console.log('📧 Resent invitation to:', contact.contactEmail);
        } catch (emailError) {
          console.error('❌ Failed to resend invite email:', emailError);
          return res.status(500).json({ message: 'Failed to send invitation email' });
        }
      }
      
      res.json({ message: 'Invitation resent successfully' });
    } catch (error) {
      console.error('Error resending invitation:', error);
      res.status(500).json({ message: 'Failed to resend invitation' });
    }
  });

  // Data release request routes
  app.post('/api/data-release-request', requireAuth, async (req, res) => {
    try {
      const requestData = insertDataReleaseRequestSchema.parse(req.body);
      
      const request = await storage.createDataReleaseRequest({
        ...requestData,
        vaultId: req.body.vaultId,
        requesterId: req.session.userId!
      });
      
      res.json({ request });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    const stats = await storage.getVaultStats();
    res.json({ stats });
  });

  app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
    const analytics = await storage.getAnalytics();
    res.json({ analytics });
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json({ users: users.map(u => ({ ...u, password: undefined })) });
  });

  app.get('/api/admin/vaults', requireAdmin, async (req, res) => {
    const vaults = await storage.getAllVaults();
    res.json({ vaults });
  });

  app.get('/api/admin/release-requests', requireAdmin, async (req, res) => {
    const requests = await storage.getDataReleaseRequests();
    res.json({ requests });
  });

  app.put('/api/admin/release-requests/:id', requireAdmin, async (req, res) => {
    const { status } = req.body;
    
    const updated = await storage.updateDataReleaseRequest(req.params.id, {
      status,
      reviewedBy: req.session.userId!
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ request: updated });
  });

  // Third party routes (admin only)
  app.get('/api/admin/third-parties', requireAdmin, async (req, res) => {
    try {
      const thirdParties = await storage.getThirdParties();
      res.json(thirdParties);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch third parties', error });
    }
  });

  app.post('/api/admin/third-parties', requireAdmin, async (req, res) => {
    try {
      const thirdPartyData = insertThirdPartySchema.parse(req.body);
      const thirdParty = await storage.createThirdParty(thirdPartyData);
      res.json(thirdParty);
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  app.put('/api/admin/third-parties/:id', requireAdmin, async (req, res) => {
    try {
      const thirdPartyData = insertThirdPartySchema.parse(req.body);
      const updated = await storage.updateThirdParty(req.params.id, thirdPartyData);
      
      if (!updated) {
        return res.status(404).json({ message: 'Third party not found' });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: 'Invalid data', error });
    }
  });

  app.delete('/api/admin/third-parties/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteThirdParty(req.params.id);
      res.json({ message: 'Third party deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete third party', error });
    }
  });

  // Admin routes - get all trusted contacts for overview
  app.get('/api/admin/trusted-contacts', requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllTrustedContacts();
      res.json({ contacts });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trusted contacts', error });
    }
  });

  // Admin route - delete user (cascade deletes vault, trusted contacts, release requests)
  app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Prevent deleting yourself
      if (userId === req.session.userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error });
    }
  });

  // Admin route - invite prospect users
  app.post('/api/admin/invite-prospects', requireAdmin, async (req, res) => {
    try {
      const prospectSchema = z.object({
        email: z.string().email('Invalid email format').max(320, 'Email too long'),
        firstName: z.string().min(1, 'First name is required').max(100, 'First name too long')
      });
      
      const prospectsArraySchema = z.array(prospectSchema).min(1, 'At least one prospect is required').max(100, 'Cannot send more than 100 invitations at once');
      
      // Validate the request body
      const validation = prospectsArraySchema.safeParse(req.body.prospects);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid prospect data',
          errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      
      const prospects = validation.data;
      
      // Deduplicate by email (case-insensitive)
      const seen = new Set<string>();
      const uniqueProspects = prospects.filter(p => {
        const emailLower = p.email.toLowerCase();
        if (seen.has(emailLower)) return false;
        seen.add(emailLower);
        return true;
      });
      
      const results = {
        sent: 0,
        failed: 0,
        skipped: prospects.length - uniqueProspects.length,
        errors: [] as string[]
      };
      
      const { sendProspectInvitation } = await import('./email');
      
      for (const prospect of uniqueProspects) {
        try {
          await sendProspectInvitation(prospect.email, prospect.firstName);
          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to send to ${prospect.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Failed to send invitation to ${prospect.email}:`, error);
        }
      }
      
      res.json({
        message: `Sent ${results.sent} invitation(s)${results.skipped > 0 ? `, skipped ${results.skipped} duplicate(s)` : ''}${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
        results
      });
    } catch (error) {
      console.error('Error sending prospect invitations:', error);
      res.status(500).json({ message: 'Failed to process invitations', error });
    }
  });

  // Chat support endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await handleChatWithAI({
        message,
        conversationHistory: conversationHistory || []
      });

      res.json({ response });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'I apologize, but I\'m having trouble right now. Please contact our support team at support@wishkeepers.com for assistance.' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
