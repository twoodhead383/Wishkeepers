import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vaults table - stores encrypted legacy information
export const vaults = pgTable("vaults", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  funeralWishes: text("funeral_wishes"), // encrypted
  lifeInsurance: text("life_insurance"), // encrypted
  banking: text("banking"), // encrypted
  personalMessages: text("personal_messages"), // encrypted
  specialRequests: text("special_requests"), // encrypted
  isComplete: boolean("is_complete").default(false),
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trusted contacts table
export const trustedContacts = pgTable("trusted_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vaultId: varchar("vault_id").notNull().references(() => vaults.id),
  contactEmail: text("contact_email").notNull(),
  contactName: text("contact_name").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, denied
  inviteToken: text("invite_token"),
  invitedAt: timestamp("invited_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Data release requests table
export const dataReleaseRequests = pgTable("data_release_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vaultId: varchar("vault_id").notNull().references(() => vaults.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  deceasedName: text("deceased_name").notNull(),
  deathCertificate: text("death_certificate"), // file path or base64
  status: text("status").notNull().default("pending"), // pending, approved, denied
  requestDate: timestamp("request_date").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export const insertVaultSchema = createInsertSchema(vaults).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  isComplete: true,
  completionPercentage: true,
});

export const insertTrustedContactSchema = createInsertSchema(trustedContacts).omit({
  id: true,
  vaultId: true,
  status: true,
  inviteToken: true,
  invitedAt: true,
  confirmedAt: true,
});

export const insertDataReleaseRequestSchema = createInsertSchema(dataReleaseRequests).omit({
  id: true,
  requestDate: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vault = typeof vaults.$inferSelect;
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type TrustedContact = typeof trustedContacts.$inferSelect;
export type InsertTrustedContact = z.infer<typeof insertTrustedContactSchema>;
export type DataReleaseRequest = typeof dataReleaseRequests.$inferSelect;
export type InsertDataReleaseRequest = z.infer<typeof insertDataReleaseRequestSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
