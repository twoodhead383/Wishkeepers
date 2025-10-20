import { 
  type User, 
  type InsertUser, 
  type Vault, 
  type InsertVault,
  type TrustedContact,
  type InsertTrustedContact,
  type DataReleaseRequest,
  type InsertDataReleaseRequest,
  type ThirdParty,
  type InsertThirdParty,
  type InterestedParty,
  type InsertInterestedParty,
  users,
  vaults,
  trustedContacts,
  dataReleaseRequests,
  thirdParties,
  interestedParties
} from "@shared/schema";
import { randomUUID } from "crypto";
import { encryptField, decryptField } from "./encryption";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "./auth";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Vaults
  getVault(id: string): Promise<Vault | undefined>;
  getVaultByUserId(userId: string): Promise<Vault | undefined>;
  createVault(vault: InsertVault & { userId: string }): Promise<Vault>;
  updateVault(id: string, vault: Partial<InsertVault>): Promise<Vault | undefined>;
  
  // Trusted Contacts
  getTrustedContacts(vaultId: string): Promise<TrustedContact[]>;
  getTrustedContact(contactId: string): Promise<TrustedContact | undefined>;
  getTrustedContactByToken(token: string): Promise<TrustedContact | undefined>;
  getTrustedContactsByEmail(email: string): Promise<TrustedContact[]>;
  createTrustedContact(contact: InsertTrustedContact & { vaultId: string }): Promise<TrustedContact>;
  updateTrustedContact(id: string, contact: Partial<TrustedContact>): Promise<TrustedContact | undefined>;
  getAllTrustedContacts(): Promise<TrustedContact[]>;
  
  // Data Release Requests
  getDataReleaseRequests(): Promise<DataReleaseRequest[]>;
  getDataReleaseRequest(id: string): Promise<DataReleaseRequest | undefined>;
  createDataReleaseRequest(request: InsertDataReleaseRequest & { vaultId: string, requesterId: string }): Promise<DataReleaseRequest>;
  updateDataReleaseRequest(id: string, request: Partial<DataReleaseRequest>): Promise<DataReleaseRequest | undefined>;
  
  // Admin functions
  getAllUsers(): Promise<User[]>;
  getAllVaults(): Promise<Vault[]>;
  getVaultStats(): Promise<{
    totalUsers: number;
    activeVaults: number;
    completedVaults: number;
    pendingRequests: number;
  }>;
  
  // Third Parties
  getThirdParties(): Promise<ThirdParty[]>;
  createThirdParty(thirdParty: InsertThirdParty): Promise<ThirdParty>;
  updateThirdParty(id: string, thirdParty: Partial<InsertThirdParty>): Promise<ThirdParty | undefined>;
  deleteThirdParty(id: string): Promise<void>;
  
  // Interested Parties
  createInterestedParty(party: InsertInterestedParty): Promise<InterestedParty>;
  listInterestedParties(): Promise<InterestedParty[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default users
    this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@wishkeepers.com')).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        const adminPassword = await hashPassword('admin123');
        await db.insert(users).values({
          email: 'admin@wishkeepers.com',
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true,
          emailVerified: true,
        });
      }

      // Check if test user exists
      const existingTest = await db.select().from(users).where(eq(users.email, 'leo@thel30project.com')).limit(1);
      
      if (existingTest.length === 0) {
        // Create test user
        const testPassword = await hashPassword('Test25');
        await db.insert(users).values({
          email: 'leo@thel30project.com',
          password: testPassword,
          firstName: 'Leo',
          lastName: 'Test',
          isAdmin: false,
        });
      }
    } catch (error) {
      console.error('Error creating default users:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getVault(id: string): Promise<Vault | undefined> {
    const [vault] = await db.select().from(vaults).where(eq(vaults.id, id));
    if (!vault) return undefined;
    
    // Decrypt fields for display
    return {
      ...vault,
      funeralWishes: vault.funeralWishes ? decryptField(vault.funeralWishes) : null,
      funeralData: vault.funeralData || null,
      lifeInsurance: vault.lifeInsurance ? decryptField(vault.lifeInsurance) : null,
      banking: vault.banking ? decryptField(vault.banking) : null,
      personalMessages: vault.personalMessages ? decryptField(vault.personalMessages) : null,
      specialRequests: vault.specialRequests ? decryptField(vault.specialRequests) : null,
    };
  }

  async getVaultByUserId(userId: string): Promise<Vault | undefined> {
    const [vault] = await db.select().from(vaults).where(eq(vaults.userId, userId));
    if (!vault) return undefined;
    
    return this.getVault(vault.id);
  }

  async createVault(vaultData: InsertVault & { userId: string }): Promise<Vault> {
    // Encrypt sensitive fields
    const encryptedData = {
      ...vaultData,
      funeralWishes: vaultData.funeralWishes && vaultData.funeralWishes.trim() ? encryptField(vaultData.funeralWishes) : null,
      funeralData: vaultData.funeralData || null,
      lifeInsurance: vaultData.lifeInsurance && vaultData.lifeInsurance.trim() ? encryptField(vaultData.lifeInsurance) : null,
      banking: vaultData.banking && vaultData.banking.trim() ? encryptField(vaultData.banking) : null,
      personalMessages: vaultData.personalMessages && vaultData.personalMessages.trim() ? encryptField(vaultData.personalMessages) : null,
      specialRequests: vaultData.specialRequests && vaultData.specialRequests.trim() ? encryptField(vaultData.specialRequests) : null,
      isComplete: false,
      completionPercentage: this.calculateCompletionPercentage(vaultData),
    };
    
    const [vault] = await db
      .insert(vaults)
      .values(encryptedData)
      .returning();
    
    const result = await this.getVault(vault.id);
    if (!result) throw new Error('Failed to retrieve created vault');
    return result;
  }

  async updateVault(id: string, vaultData: Partial<InsertVault>): Promise<Vault | undefined> {
    const [existing] = await db.select().from(vaults).where(eq(vaults.id, id));
    if (!existing) return undefined;
    
    // Encrypt updated fields
    const updates: any = {
      ...vaultData,
      funeralWishes: vaultData.funeralWishes !== undefined ? 
        (vaultData.funeralWishes && vaultData.funeralWishes.trim() ? encryptField(vaultData.funeralWishes) : null) : 
        existing.funeralWishes,
      funeralData: vaultData.funeralData !== undefined ? 
        (vaultData.funeralData || null) : 
        existing.funeralData,
      lifeInsurance: vaultData.lifeInsurance !== undefined ? 
        (vaultData.lifeInsurance && vaultData.lifeInsurance.trim() ? encryptField(vaultData.lifeInsurance) : null) : 
        existing.lifeInsurance,
      banking: vaultData.banking !== undefined ? 
        (vaultData.banking && vaultData.banking.trim() ? encryptField(vaultData.banking) : null) : 
        existing.banking,
      personalMessages: vaultData.personalMessages !== undefined ? 
        (vaultData.personalMessages && vaultData.personalMessages.trim() ? encryptField(vaultData.personalMessages) : null) : 
        existing.personalMessages,
      specialRequests: vaultData.specialRequests !== undefined ? 
        (vaultData.specialRequests && vaultData.specialRequests.trim() ? encryptField(vaultData.specialRequests) : null) : 
        existing.specialRequests,
      updatedAt: new Date(),
    };
    
    // Calculate completion percentage
    const tempData = { ...existing, ...vaultData };
    updates.completionPercentage = this.calculateCompletionPercentage(tempData);
    updates.isComplete = updates.completionPercentage === 100;
    
    await db.update(vaults).set(updates).where(eq(vaults.id, id));
    return this.getVault(id);
  }

  private calculateCompletionPercentage(vault: Partial<InsertVault | Vault>): number {
    const fields = ['funeralWishes', 'funeralData', 'lifeInsurance', 'banking', 'personalMessages', 'specialRequests'];
    const completed = fields.filter(field => {
      const value = vault[field as keyof typeof vault];
      return value && (typeof value === 'string' ? value.trim() : true);
    }).length;
    return Math.round((completed / fields.length) * 100);
  }

  async getTrustedContacts(vaultId: string): Promise<TrustedContact[]> {
    return await db.select().from(trustedContacts).where(eq(trustedContacts.vaultId, vaultId));
  }

  async getTrustedContact(contactId: string): Promise<TrustedContact | undefined> {
    const [contact] = await db.select().from(trustedContacts).where(eq(trustedContacts.id, contactId)).limit(1);
    return contact || undefined;
  }

  async getTrustedContactByToken(token: string): Promise<TrustedContact | undefined> {
    const [contact] = await db.select().from(trustedContacts).where(eq(trustedContacts.inviteToken, token));
    return contact || undefined;
  }

  async getTrustedContactsByEmail(email: string): Promise<TrustedContact[]> {
    return await db.select().from(trustedContacts).where(eq(trustedContacts.contactEmail, email));
  }

  async createTrustedContact(contactData: InsertTrustedContact & { vaultId: string }): Promise<TrustedContact> {
    const [contact] = await db
      .insert(trustedContacts)
      .values({
        ...contactData,
        status: 'pending',
        inviteToken: randomUUID(),
      })
      .returning();
    return contact;
  }

  async updateTrustedContact(id: string, contactData: Partial<TrustedContact>): Promise<TrustedContact | undefined> {
    const updates: any = { ...contactData };
    if (contactData.status === 'confirmed') {
      updates.confirmedAt = new Date();
    }
    
    const [updated] = await db
      .update(trustedContacts)
      .set(updates)
      .where(eq(trustedContacts.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllTrustedContacts(): Promise<TrustedContact[]> {
    return await db.select().from(trustedContacts);
  }

  async getDataReleaseRequests(): Promise<DataReleaseRequest[]> {
    return await db.select().from(dataReleaseRequests);
  }

  async getDataReleaseRequest(id: string): Promise<DataReleaseRequest | undefined> {
    const [request] = await db.select().from(dataReleaseRequests).where(eq(dataReleaseRequests.id, id));
    return request || undefined;
  }

  async createDataReleaseRequest(requestData: InsertDataReleaseRequest & { vaultId: string, requesterId: string }): Promise<DataReleaseRequest> {
    const [request] = await db
      .insert(dataReleaseRequests)
      .values({
        ...requestData,
        status: 'pending',
        deathCertificate: requestData.deathCertificate || null,
      })
      .returning();
    return request;
  }

  async updateDataReleaseRequest(id: string, requestData: Partial<DataReleaseRequest>): Promise<DataReleaseRequest | undefined> {
    const updates: any = { ...requestData };
    if (requestData.status && requestData.status !== 'pending') {
      updates.reviewedAt = new Date();
    }
    
    const [updated] = await db
      .update(dataReleaseRequests)
      .set(updates)
      .where(eq(dataReleaseRequests.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllVaults(): Promise<Vault[]> {
    return await db.select().from(vaults);
  }

  async getVaultStats(): Promise<{
    totalUsers: number;
    activeVaults: number;
    completedVaults: number;
    pendingRequests: number;
  }> {
    const allUsers = await this.getAllUsers();
    const allVaults = await this.getAllVaults();
    const requests = await this.getDataReleaseRequests();
    
    return {
      totalUsers: allUsers.length,
      activeVaults: allVaults.length,
      completedVaults: allVaults.filter(v => v.isComplete).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
    };
  }

  async getAnalytics() {
    const allUsers = await this.getAllUsers();
    const allVaults = await this.getAllVaults();
    const allRequests = await this.getDataReleaseRequests();

    // User registrations over time (last 12 months)
    const userRegistrations = this.getTimeSeriesData(allUsers, 'createdAt', 12);
    
    // Vault completion times (days to complete)
    const vaultCompletionTimes = allVaults
      .filter(v => v.isComplete && v.createdAt && v.updatedAt)
      .map(v => ({
        days: Math.ceil((new Date(v.updatedAt!).getTime() - new Date(v.createdAt!).getTime()) / (1000 * 60 * 60 * 24)),
        completedAt: v.updatedAt
      }))
      .sort((a, b) => a.days - b.days);

    // Release requests over time (last 12 months)
    const releaseRequests = this.getTimeSeriesData(allRequests, 'createdAt', 12);

    return {
      userRegistrations,
      vaultCompletionTimes,
      releaseRequests,
    };
  }

  private getTimeSeriesData(data: any[], dateField: string, months: number) {
    const now = new Date();
    const result = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const count = data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= monthStart && itemDate <= monthEnd;
      }).length;

      result.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
        date: monthStart.toISOString()
      });
    }
    
    return result;
  }

  // Third Party methods
  async getThirdParties(): Promise<ThirdParty[]> {
    return await db.select().from(thirdParties);
  }

  async createThirdParty(thirdPartyData: InsertThirdParty): Promise<ThirdParty> {
    const [thirdParty] = await db
      .insert(thirdParties)
      .values({
        ...thirdPartyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return thirdParty;
  }

  async updateThirdParty(id: string, thirdPartyData: Partial<InsertThirdParty>): Promise<ThirdParty | undefined> {
    const [updated] = await db
      .update(thirdParties)
      .set({
        ...thirdPartyData,
        updatedAt: new Date(),
      })
      .where(eq(thirdParties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteThirdParty(id: string): Promise<void> {
    await db.delete(thirdParties).where(eq(thirdParties.id, id));
  }

  // Interested Parties methods
  async createInterestedParty(partyData: InsertInterestedParty): Promise<InterestedParty> {
    const [party] = await db
      .insert(interestedParties)
      .values(partyData)
      .returning();
    return party;
  }

  async listInterestedParties(): Promise<InterestedParty[]> {
    return await db.select().from(interestedParties);
  }
}

export const storage = new DatabaseStorage();
