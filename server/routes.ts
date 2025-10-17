import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { hashPassword, comparePassword, requireAuth, requireAdmin } from "./auth";
import { sendTrustedContactInvite } from "./email";
import { handleChatWithAI } from "./chat";
import { 
  insertUserSchema, 
  loginSchema, 
  insertVaultSchema,
  insertTrustedContactSchema,
  insertDataReleaseRequestSchema,
  insertThirdPartySchema
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
      
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
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

  app.post('/api/trusted-contacts/:token/accept', async (req, res) => {
    const contact = await storage.getTrustedContactByToken(req.params.token);
    if (!contact) {
      return res.status(404).json({ message: 'Invalid invite token' });
    }
    
    const updated = await storage.updateTrustedContact(contact.id, {
      status: 'confirmed'
    });
    
    res.json({ contact: updated });
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
