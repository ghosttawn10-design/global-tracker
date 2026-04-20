import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("GlobalTrack Logistique"),
  heroTitle: text("hero_title").notNull().default("Track Every Shipment, Everywhere."),
  heroSubtitle: text("hero_subtitle").notNull().default("Premium global logistics with precision tracking and real-time updates. Your packages are always in sight, always on time."),
  primaryColor: text("primary_color").default("#0066FF"),
  logoUrl: text("logo_url"),
  heroImages: text("hero_images"),
  heroImageSlideEnabled: boolean("hero_image_slide_enabled").notNull().default(false),
  heroImageSlideInterval: integer("hero_image_slide_interval").notNull().default(5),
  whatsappNumber: text("whatsapp_number"),
  whatsappEnabled: boolean("whatsapp_enabled").notNull().default(false),
  telegramLink: text("telegram_link"),
  telegramEnabled: boolean("telegram_enabled").notNull().default(false),
  tawktoScript: text("tawkto_script"),
  tawktoEnabled: boolean("tawkto_enabled").notNull().default(false),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  smtpHost: text("smtp_host"),
  smtpPort: text("smtp_port").default("587"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  smtpFrom: text("smtp_from"),
  smtpTo: text("smtp_to"),
  smtpEnabled: boolean("smtp_enabled").notNull().default(false),
  darkModeDefault: boolean("dark_mode_default").notNull().default(true),
  privacyPolicy: text("privacy_policy"),
  termsOfService: text("terms_of_service"),
  cookiesPolicy: text("cookies_policy"),
  businessHours: text("business_hours"),
  businessHoursTimezone: text("business_hours_timezone").default("America/New_York"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("Admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsersTable).omit({ id: true, createdAt: true });

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsersTable.$inferSelect;
