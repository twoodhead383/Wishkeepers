import { 
  type User, 
  type InsertUser, 
  type Vault, 
  type InsertVault,
  type TrustedContact,
  type InsertTrustedContact,
  type DataReleaseRequest,
  type InsertDataReleaseRequest
} from "@shared/schema";
import { randomUUID } from "crypto";
import { encryptField, decryptField } from "./encryption";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vaults
  getVault(id: string): Promise<Vault | undefined>;
  getVaultByUserId(userId: string): Promise<Vault | undefined>;
  createVault(vault: InsertVault & { userId: string }): Promise<Vault>;
  updateVault(id: string, vault: Partial<InsertVault>): Promise<Vault | undefined>;
  
  // Trusted Contacts
  getTrustedContacts(vaultId: string): Promise<TrustedContact[]>;
  getTrustedContactByToken(token: string): Promise<TrustedContact | undefined>;
  createTrustedContact(contact: InsertTrustedContact & { vaultId: string }): Promise<TrustedContact>;
  updateTrustedContact(id: string, contact: Partial<TrustedContact>): Promise<TrustedContact | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vaults: Map<string, Vault>;
  private trustedContacts: Map<string, TrustedContact>;
  private dataReleaseRequests: Map<string, DataReleaseRequest>;

  constructor() {
    this.users = new Map();
    this.vaults = new Map();
    this.trustedContacts = new Map();
    this.dataReleaseRequests = new Map();
    
    // Create admin user
    this.createAdminUser();
  }

  private async createAdminUser() {
    const { hashPassword } = await import('./auth');
    
    // Create admin user
    const adminId = randomUUID();
    const adminPassword = await hashPassword('admin123');
    const admin: User = {
      id: adminId,
      email: 'admin@wishkeepers.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create test user leo@thel30project.com
    const testUserId = randomUUID();
    const testPassword = await hashPassword('Test25');
    const testUser: User = {
      id: testUserId,
      email: 'leo@thel30project.com',
      password: testPassword,
      firstName: 'Leo',
      lastName: 'Test',
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(testUserId, testUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getVault(id: string): Promise<Vault | undefined> {
    const vault = this.vaults.get(id);
    if (!vault) return undefined;
    
    // Decrypt fields for display
    return {
      ...vault,
      funeralWishes: vault.funeralWishes ? decryptField(vault.funeralWishes) : null,
      lifeInsurance: vault.lifeInsurance ? decryptField(vault.lifeInsurance) : null,
      banking: vault.banking ? decryptField(vault.banking) : null,
      personalMessages: vault.personalMessages ? decryptField(vault.personalMessages) : null,
      specialRequests: vault.specialRequests ? decryptField(vault.specialRequests) : null,
    };
  }

  async getVaultByUserId(userId: string): Promise<Vault | undefined> {
    const vault = Array.from(this.vaults.values()).find(v => v.userId === userId);
    if (!vault) return undefined;
    
    return this.getVault(vault.id);
  }

  async createVault(vaultData: InsertVault & { userId: string }): Promise<Vault> {
    const id = randomUUID();
    const now = new Date();
    
    // Encrypt sensitive fields
    const vault: Vault = {
      ...vaultData,
      id,
      funeralWishes: vaultData.funeralWishes ? encryptField(vaultData.funeralWishes) : null,
      lifeInsurance: vaultData.lifeInsurance ? encryptField(vaultData.lifeInsurance) : null,
      banking: vaultData.banking ? encryptField(vaultData.banking) : null,
      personalMessages: vaultData.personalMessages ? encryptField(vaultData.personalMessages) : null,
      specialRequests: vaultData.specialRequests ? encryptField(vaultData.specialRequests) : null,
      isComplete: false,
      completionPercentage: this.calculateCompletionPercentage(vaultData),
      createdAt: now,
      updatedAt: now,
    };
    
    this.vaults.set(id, vault);
    const decryptedVault = await this.getVault(id);
    return decryptedVault!;
  }

  async updateVault(id: string, vaultData: Partial<InsertVault>): Promise<Vault | undefined> {
    const existing = this.vaults.get(id);
    if (!existing) return undefined;
    
    // Encrypt updated fields
    const updates: Partial<Vault> = {
      ...vaultData,
      funeralWishes: vaultData.funeralWishes ? encryptField(vaultData.funeralWishes) : existing.funeralWishes,
      lifeInsurance: vaultData.lifeInsurance ? encryptField(vaultData.lifeInsurance) : existing.lifeInsurance,
      banking: vaultData.banking ? encryptField(vaultData.banking) : existing.banking,
      personalMessages: vaultData.personalMessages ? encryptField(vaultData.personalMessages) : existing.personalMessages,
      specialRequests: vaultData.specialRequests ? encryptField(vaultData.specialRequests) : existing.specialRequests,
      updatedAt: new Date(),
    };
    
    const updated = { ...existing, ...updates };
    updated.completionPercentage = this.calculateCompletionPercentage(updated);
    updated.isComplete = updated.completionPercentage === 100;
    
    this.vaults.set(id, updated);
    return this.getVault(id);
  }

  private calculateCompletionPercentage(vault: Partial<InsertVault | Vault>): number {
    const fields = ['funeralWishes', 'lifeInsurance', 'banking', 'personalMessages', 'specialRequests'];
    const completed = fields.filter(field => vault[field as keyof typeof vault]).length;
    return Math.round((completed / fields.length) * 100);
  }

  async getTrustedContacts(vaultId: string): Promise<TrustedContact[]> {
    return Array.from(this.trustedContacts.values()).filter(contact => contact.vaultId === vaultId);
  }

  async getTrustedContactByToken(token: string): Promise<TrustedContact | undefined> {
    return Array.from(this.trustedContacts.values()).find(contact => contact.inviteToken === token);
  }

  async createTrustedContact(contactData: InsertTrustedContact & { vaultId: string }): Promise<TrustedContact> {
    const id = randomUUID();
    const contact: TrustedContact = {
      ...contactData,
      id,
      status: 'pending',
      inviteToken: randomUUID(),
      invitedAt: new Date(),
      confirmedAt: null,
    };
    
    this.trustedContacts.set(id, contact);
    return contact;
  }

  async updateTrustedContact(id: string, contactData: Partial<TrustedContact>): Promise<TrustedContact | undefined> {
    const existing = this.trustedContacts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contactData };
    if (contactData.status === 'confirmed') {
      updated.confirmedAt = new Date();
    }
    
    this.trustedContacts.set(id, updated);
    return updated;
  }

  async getDataReleaseRequests(): Promise<DataReleaseRequest[]> {
    return Array.from(this.dataReleaseRequests.values());
  }

  async getDataReleaseRequest(id: string): Promise<DataReleaseRequest | undefined> {
    return this.dataReleaseRequests.get(id);
  }

  async createDataReleaseRequest(requestData: InsertDataReleaseRequest & { vaultId: string, requesterId: string }): Promise<DataReleaseRequest> {
    const id = randomUUID();
    const request: DataReleaseRequest = {
      ...requestData,
      id,
      status: 'pending',
      requestDate: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      deathCertificate: requestData.deathCertificate || null,
    };
    
    this.dataReleaseRequests.set(id, request);
    return request;
  }

  async updateDataReleaseRequest(id: string, requestData: Partial<DataReleaseRequest>): Promise<DataReleaseRequest | undefined> {
    const existing = this.dataReleaseRequests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...requestData };
    if (requestData.status && requestData.status !== 'pending') {
      updated.reviewedAt = new Date();
    }
    
    this.dataReleaseRequests.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllVaults(): Promise<Vault[]> {
    return Array.from(this.vaults.values());
  }

  async getVaultStats(): Promise<{
    totalUsers: number;
    activeVaults: number;
    completedVaults: number;
    pendingRequests: number;
  }> {
    const users = await this.getAllUsers();
    const vaults = await this.getAllVaults();
    const requests = await this.getDataReleaseRequests();
    
    return {
      totalUsers: users.length,
      activeVaults: vaults.length,
      completedVaults: vaults.filter(v => v.isComplete).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
    };
  }
}

export const storage = new MemStorage();
