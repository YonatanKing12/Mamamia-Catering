/**
 * סכימת מסד הנתונים — צד שרת בלבד.
 *
 * אין לייבא את הקובץ הזה מקוד קליינט: הוא גורר את drizzle-orm/pg-core לבאנדל
 * ומפרסם את שמות הטבלאות והעמודות בקובץ JS ציבורי.
 * ולידציה משותפת נמצאת ב־shared/lead-schema.ts, שהוא zod בלבד.
 */

import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, text, varchar, timestamp, integer, serial, boolean, jsonb, index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ═══════════════════ enums ═══════════════════ */

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
  "disqualified",
]);

export const leadPathEnum = pgEnum("lead_path", [
  "quote_form",
  "wa_intent",
  "phone",
  "menu_download",
  "draft_upgrade",
]);

export const branchEnum = pgEnum("branch", ["herzliya_pituach", "raanana", "petah_tikva"]);

export const contactChannelEnum = pgEnum("contact_channel", ["whatsapp", "phone", "email"]);

/* ═══════════════════ leads ═══════════════════ */

/**
 * מאגר הלידים.
 *
 * חובת רישום מאגר מול הרשות להגנת הפרטיות אינה חלה על מאגר בהיקף כזה,
 * אך אם הטבלה חוצה עשרות אלפי שורות — או אם מתווסף שדה של מידע רפואי,
 * דתי או ביומטרי — הדבר טעון בדיקה משפטית לפני שהשדה עולה לפרודקשן.
 *
 * אין להוסיף כאן שדה שמזמין מידע רפואי (אלרגיות, מגבלות תזונה). מידע כזה
 * נאסף אחרי סגירת ההזמנה, בערוץ התפעולי, לתיק האירוע — לא בטופס הליד.
 */
export const leads = pgTable(
  "leads",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    /* ── מזהה אנושי, מוצג ללקוח ומופיע בהודעת הוואטסאפ ── */
    ref: varchar("ref", { length: 12 }).notNull().unique(),
    refAliases: text("ref_aliases").array(),

    /* ── מי ── nullable: ליד וואטסאפ נוצר לפני שהוקלד שם ── */
    name: text("name"),
    phone: text("phone"),
    phoneE164: text("phone_e164"),
    phoneSha256: text("phone_sha256"),
    email: text("email"),
    emailSha256: text("email_sha256"),
    contactChannel: contactChannelEnum("contact_channel"),

    /* ── מה ── */
    eventType: text("event_type"),
    guestBand: text("guest_band"),
    guestBandVersion: text("guest_band_version"),
    guestCount: integer("guest_count"),
    eventDate: text("event_date"),
    dateFlexible: boolean("date_flexible").default(false),
    dateFlag: text("date_flag"),
    area: text("area"),
    areaIsFreeText: boolean("area_is_free_text").default(false),
    branch: branchEnum("branch"),
    serviceFormat: text("service_format"),
    selectedDishes: text("selected_dishes").array(),
    answers: jsonb("answers"),
    notes: text("notes"),

    /* ── מאיפה ── */
    path: leadPathEnum("path").notNull(),
    sourcePage: text("source_page"),
    landingPage: text("landing_page"),
    referrer: text("referrer"),
    waLocation: text("wa_location"),
    sessionId: varchar("session_id", { length: 40 }),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    utmId: text("utm_id"),
    firstTouchSource: text("first_touch_source"),
    firstTouchAt: timestamp("first_touch_at", { withTimezone: true }),
    touchCount: integer("touch_count"),

    /* ── מזהי קליק ── gbraid/wbraid מגיעים ב־iOS במקום gclid, לא לצידו ── */
    gclid: text("gclid"),
    gbraid: text("gbraid"),
    wbraid: text("wbraid"),
    fbclid: text("fbclid"),
    msclkid: text("msclkid"),
    ttclid: text("ttclid"),
    clickIdCapturedAt: timestamp("click_id_captured_at", { withTimezone: true }),

    /* ── GA4 ── */
    gaClientId: text("ga_client_id"),
    gaSessionId: text("ga_session_id"),

    /* ── וואטסאפ ── */
    waId: text("wa_id"),
    waProfileName: text("wa_profile_name"),
    ctwaClid: text("ctwa_clid"),
    firstInboundAt: timestamp("first_inbound_at", { withTimezone: true }),
    firstReplyAt: timestamp("first_reply_at", { withTimezone: true }),

    /* ── הסכמות ── */
    consentMarketing: boolean("consent_marketing").notNull().default(false),
    consentMarketingAt: timestamp("consent_marketing_at", { withTimezone: true }),
    consentAnalytics: boolean("consent_analytics"),
    consentAdUserData: boolean("consent_ad_user_data"),
    consentTextVersion: text("consent_text_version"),
    noticeVersion: text("notice_version"),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    unsubscribeToken: varchar("unsubscribe_token", { length: 40 }),

    /* ── צינור המכירה ── */
    status: leadStatusEnum("status").notNull().default("new"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }),
    /* טביעת אצבע של הטוקן, לא שם אדם */
    statusChangedBy: text("status_changed_by"),
    lostReason: text("lost_reason"),
    quotedValueIls: integer("quoted_value_ils"),
    wonValueIls: integer("won_value_ils"),
    wonAt: timestamp("won_at", { withTimezone: true }),
    convertedAt: timestamp("converted_at", { withTimezone: true }),

    /* ── תפעול ── */
    draftId: varchar("draft_id", { length: 40 }),
    stepsCompleted: integer("steps_completed"),
    timeToCompleteMs: integer("time_to_complete_ms"),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    notifyAttempts: integer("notify_attempts").notNull().default(0),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    adsUploadStatus: text("ads_upload_status"),
    adsUploadedAt: timestamp("ads_uploaded_at", { withTimezone: true }),
    gaMpUploadStatus: text("ga_mp_upload_status"),
    isTest: boolean("is_test").notNull().default(false),
    duplicateOf: varchar("duplicate_of"),
    purgeAfter: timestamp("purge_after", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("leads_created_idx").on(t.createdAt),
    statusIdx: index("leads_status_idx").on(t.status),
    pathIdx: index("leads_path_idx").on(t.path),
    branchIdx: index("leads_branch_idx").on(t.branch),
    purgeIdx: index("leads_purge_idx").on(t.purgeAfter),
    sessionIdx: index("leads_session_idx").on(t.sessionId, t.waLocation),
    phoneIdx: index("leads_phone_idx").on(t.phoneE164),
  }),
);

/* ═══════════════════ quote_drafts ═══════════════════ */

/** אין כאן מידע אישי. אף פעם. רק תשובות מרשימה סגורה, תאריך, ומזהי מנות. */
export const quoteDrafts = pgTable(
  "quote_drafts",
  {
    draftId: varchar("draft_id", { length: 40 }).primaryKey(),
    sessionId: varchar("session_id", { length: 40 }),
    step: integer("step").notNull().default(1),
    eventType: text("event_type"),
    guestBand: text("guest_band"),
    eventDate: text("event_date"),
    area: text("area"),
    serviceFormat: text("service_format"),
    selectedDishes: text("selected_dishes").array(),
    sourcePage: text("source_page"),
    utmSource: text("utm_source"),
    utmCampaign: text("utm_campaign"),
    upgradedLeadId: varchar("upgraded_lead_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ updatedIdx: index("drafts_updated_idx").on(t.updatedAt) }),
);

/* ═══════════════════ lead_events ═══════════════════ */

/** יומן append-only. מאפשר לשחזר מעברי סטטוס ולנסות שוב העלאות שנכשלו. */
export const leadEvents = pgTable(
  "lead_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leadId: varchar("lead_id").notNull(),
    eventName: text("event_name").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ leadIdx: index("lead_events_lead_idx").on(t.leadId) }),
);

/* ═══════════════════ תוכן ═══════════════════ */

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  published: timestamp("published").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * המלצות לקוחות.
 * `consentGiven` אינו עמודה — הוא שער כניסה ב־server/seed.ts. שורה נכנסת
 * לכאן רק אחרי אישור מפורש של הלקוח לשימוש בשמו.
 */
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  eventDate: text("event_date"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  eventType: text("event_type"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ═══════════════════ טיפוסים ═══════════════════ */

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true, createdAt: true, updatedAt: true,
});
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true, createdAt: true,
});
export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true, createdAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type QuoteDraft = typeof quoteDrafts.$inferSelect;
export type InsertQuoteDraft = typeof quoteDrafts.$inferInsert;
export type LeadEvent = typeof leadEvents.$inferSelect;
export type InsertLeadEvent = typeof leadEvents.$inferInsert;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;
