import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  emailVerified: boolean("email_verified").default(false),
  verificationCode: text("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vaults table - stores encrypted legacy information
export const vaults = pgTable("vaults", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  funeralWishes: text("funeral_wishes"), // encrypted - legacy text field for backward compatibility
  funeralData: jsonb("funeral_data"), // encrypted - new structured funeral data
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
}).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  email: z.string().email("Invalid email format").max(320, "Email too long"),
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long")
});

// Funeral data schema
export const funeralDataSchema = z.object({
  religiousOrientation: z.enum(['religious', 'spiritual', 'neither']).optional(),
  denomination: z.string().optional(),
  spiritualElements: z.boolean().optional(),
  faithLeader: z.string().optional(),
  serviceLocation: z.string().optional(),
  readings: z.array(z.string()).default([]),
  traditions: z.array(z.string()).default([]),
  dressCode: z.string().optional(),
  naturePreferences: z.string().optional(),
  poems: z.array(z.string()).default([]),
  music: z.array(z.string()).default([]),
  serviceType: z.enum(['formal', 'informal', 'celebration_of_life', 'private', 'public']).optional(),
  disposalMethod: z.enum(['burial', 'cremation', 'eco_burial', 'other']).optional(),
  disposalDetails: z.string().optional(),
  remainsLocation: z.string().optional(),
  attendees: z.object({
    include: z.array(z.string()).default([]),
    exclude: z.array(z.string()).default([]),
  }).optional(),
  tone: z.enum(['somber', 'celebratory', 'humour_welcomed', 'mixed']).optional(),
  speakers: z.array(z.string()).default([]),
  visuals: z.object({
    photos: z.boolean().default(false),
    slideshow: z.boolean().default(false),
    videos: z.boolean().default(false),
  }).optional(),
  familyNotes: z.string().optional(),
});

export const insertVaultSchema = createInsertSchema(vaults).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  isComplete: true,
  completionPercentage: true,
}).extend({
  funeralWishes: z.string().optional(),
  funeralData: funeralDataSchema.optional(),
  lifeInsurance: z.string().optional(),
  banking: z.string().optional(),
  personalMessages: z.string().optional(),
  specialRequests: z.string().optional(),
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
  requesterId: true,
  requestDate: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true,
});

// Third Party Partners Schema
export const thirdParties = pgTable("third_parties", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  referralLink: text("referral_link"),
  serviceCategory: text("service_category").notNull(),
  description: text("description").notNull(),
  agreementDate: text("agreement_date").notNull(),
  status: text("status", { enum: ["active", "inactive", "pending"] }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertThirdPartySchema = createInsertSchema(thirdParties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Interested Parties Schema - for holding page email capture
export const interestedParties = pgTable("interested_parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  consent: boolean("consent").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterestedPartySchema = createInsertSchema(interestedParties).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email format").max(320, "Email too long"),
  fullName: z.string().min(1, "Name is required").max(200, "Name too long"),
  consent: z.boolean().default(true),
  notes: z.string().max(1000, "Notes too long").optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(320, "Email too long"),
  password: z.string().min(1, "Password is required").max(200, "Password too long"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vault = typeof vaults.$inferSelect;
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type FuneralData = z.infer<typeof funeralDataSchema>;
export type TrustedContact = typeof trustedContacts.$inferSelect;
export type InsertTrustedContact = z.infer<typeof insertTrustedContactSchema>;
export type DataReleaseRequest = typeof dataReleaseRequests.$inferSelect;
export type InsertDataReleaseRequest = z.infer<typeof insertDataReleaseRequestSchema>;
export type ThirdParty = typeof thirdParties.$inferSelect;
export type InsertThirdParty = z.infer<typeof insertThirdPartySchema>;
export type InterestedParty = typeof interestedParties.$inferSelect;
export type InsertInterestedParty = z.infer<typeof insertInterestedPartySchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
