/**
 * שכבת האחסון.
 *
 * שני מימושים מאחורי ממשק אחד:
 *   DatabaseStorage — Postgres דרך Drizzle. נבחר כשקיים DATABASE_URL.
 *   MemoryStorage   — בזיכרון התהליך. ברירת מחדל לפיתוח מקומי בלי הגדרות.
 *
 * חובת זהות בין המימושים: לטבלת leads יש ~60 עמודות, ו־MemoryStorage חייב
 * לכתוב כל אחת מהן. אחרת מסלול ה־Postgres עובד, מסלול הפיתוח משמיט בשקט
 * את שדות הייחוס, ואיש לא מגלה עד שבודקים נתונים בפרודקשן.
 * בדיקת הזהות רצה ב־server/storage.parity.ts ונכשלת אם נוספה עמודה בלי
 * שורה מקבילה כאן.
 */

import { getTableColumns } from "drizzle-orm";
import { eq, desc, and, sql as dsql } from "drizzle-orm";
import {
  leads, quoteDrafts, leadEvents,
  blogPosts, testimonials, galleryItems,
  type Lead, type InsertLead,
  type QuoteDraft, type InsertQuoteDraft,
  type LeadEvent, type InsertLeadEvent,
  type BlogPost, type InsertBlogPost,
  type Testimonial, type InsertTestimonial,
  type GalleryItem, type InsertGalleryItem,
} from "@shared/schema";
import { db, hasDatabase } from "./db";

export interface LeadQuery {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface IStorage {
  /* לידים */
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, patch: Partial<InsertLead>): Promise<Lead | undefined>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByRef(ref: string): Promise<Lead | undefined>;
  /** איחוד ליד וואטסאפ עם שליחת טופס מאוחר יותר מאותה לשונית */
  findRecentLeadBySession(sessionId: string, withinMs: number): Promise<Lead | undefined>;
  listLeads(q?: LeadQuery): Promise<Lead[]>;

  /* טיוטות */
  upsertDraft(draft: InsertQuoteDraft): Promise<QuoteDraft>;
  getDraft(draftId: string): Promise<QuoteDraft | undefined>;

  /* יומן */
  logLeadEvent(event: InsertLeadEvent): Promise<LeadEvent>;
  getLeadEvents(leadId: string): Promise<LeadEvent[]>;

  /* תוכן */
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createTestimonial(t: InsertTestimonial): Promise<Testimonial>;
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  createGalleryItem(g: InsertGalleryItem): Promise<GalleryItem>;
  getGalleryItems(): Promise<GalleryItem[]>;
  getFeaturedGalleryItems(): Promise<GalleryItem[]>;
}

/* ═══════════════════ Postgres ═══════════════════ */

export class DatabaseStorage implements IStorage {
  private get d() {
    if (!db) throw new Error("DatabaseStorage נבחר אך אין חיבור למסד נתונים");
    return db;
  }

  async createLead(lead: InsertLead) {
    const [row] = await this.d.insert(leads).values(lead).returning();
    return row;
  }

  async updateLead(id: string, patch: Partial<InsertLead>) {
    const [row] = await this.d
.update(leads)
.set({ ...patch, updatedAt: new Date() })
.where(eq(leads.id, id))
.returning();
    return row;
  }

  async getLead(id: string) {
    const [row] = await this.d.select().from(leads).where(eq(leads.id, id));
    return row;
  }

  async getLeadByRef(ref: string) {
    const [row] = await this.d.select().from(leads).where(eq(leads.ref, ref));
    return row;
  }

  async findRecentLeadBySession(sessionId: string, withinMs: number) {
    const since = new Date(Date.now() - withinMs);
    const [row] = await this.d
.select()
.from(leads)
.where(and(eq(leads.sessionId, sessionId), dsql`${leads.createdAt} > ${since}`))
.orderBy(desc(leads.createdAt))
.limit(1);
    return row;
  }

  async listLeads(q: LeadQuery = {}) {
    const base = this.d.select().from(leads);
    const rows = q.status
      ? await base.where(dsql`${leads.status}::text = ${q.status}`)
.orderBy(desc(leads.createdAt)).limit(q.limit ?? 200).offset(q.offset ?? 0)
      : await base.orderBy(desc(leads.createdAt)).limit(q.limit ?? 200).offset(q.offset ?? 0);
    return rows;
  }

  async upsertDraft(draft: InsertQuoteDraft) {
    const [row] = await this.d
.insert(quoteDrafts)
.values(draft)
.onConflictDoUpdate({
        target: quoteDrafts.draftId,
        set: { ...draft, updatedAt: new Date() },
      })
.returning();
    return row;
  }

  async getDraft(draftId: string) {
    const [row] = await this.d.select().from(quoteDrafts).where(eq(quoteDrafts.draftId, draftId));
    return row;
  }

  async logLeadEvent(event: InsertLeadEvent) {
    const [row] = await this.d.insert(leadEvents).values(event).returning();
    return row;
  }

  async getLeadEvents(leadId: string) {
    return this.d.select().from(leadEvents)
.where(eq(leadEvents.leadId, leadId))
.orderBy(desc(leadEvents.createdAt));
  }

  async createBlogPost(p: InsertBlogPost) {
    const [row] = await this.d.insert(blogPosts).values(p).returning();
    return row;
  }
  async getBlogPosts() {
    return this.d.select().from(blogPosts).orderBy(desc(blogPosts.published));
  }
  async getBlogPostBySlug(slug: string) {
    const [row] = await this.d.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return row;
  }
  async createTestimonial(t: InsertTestimonial) {
    const [row] = await this.d.insert(testimonials).values(t).returning();
    return row;
  }
  async getTestimonials() {
    return this.d.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }
  async getFeaturedTestimonials() {
    return this.d.select().from(testimonials)
.where(eq(testimonials.featured, true)).orderBy(desc(testimonials.createdAt));
  }
  async createGalleryItem(g: InsertGalleryItem) {
    const [row] = await this.d.insert(galleryItems).values(g).returning();
    return row;
  }
  async getGalleryItems() {
    return this.d.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
  }
  async getFeaturedGalleryItems() {
    return this.d.select().from(galleryItems)
.where(eq(galleryItems.featured, true)).orderBy(desc(galleryItems.createdAt));
  }
}

/* ═══════════════════ זיכרון ═══════════════════ */

export class MemoryStorage implements IStorage {
  private leadRows: Lead[] = [];
  private draftRows = new Map<string, QuoteDraft>();
  private eventRows: LeadEvent[] = [];
  private posts: BlogPost[] = [];
  private quotes: Testimonial[] = [];
  private gallery: GalleryItem[] = [];
  private seq = { post: 1, quote: 1, gallery: 1 };

  /**
   * בונה שורת ליד מלאה. כל עמודה בסכימה מקבלת ערך מפורש — זו הנקודה שבה
   * זהות המימושים נשמרת או נשברת. בדיקת הזהות משווה את המפתחות כאן מול
   * getTableColumns(leads).
   */
  async createLead(l: InsertLead): Promise<Lead> {
    const now = new Date();
    const row: Lead = {
      id: crypto.randomUUID(),
      ref: l.ref,
      refAliases: l.refAliases ?? null,

      name: l.name ?? null,
      phone: l.phone ?? null,
      phoneE164: l.phoneE164 ?? null,
      phoneSha256: l.phoneSha256 ?? null,
      email: l.email ?? null,
      emailSha256: l.emailSha256 ?? null,
      contactChannel: l.contactChannel ?? null,

      eventType: l.eventType ?? null,
      guestBand: l.guestBand ?? null,
      guestBandVersion: l.guestBandVersion ?? null,
      guestCount: l.guestCount ?? null,
      eventDate: l.eventDate ?? null,
      dateFlexible: l.dateFlexible ?? false,
      dateFlag: l.dateFlag ?? null,
      area: l.area ?? null,
      areaIsFreeText: l.areaIsFreeText ?? false,
      branch: l.branch ?? null,
      serviceFormat: l.serviceFormat ?? null,
      selectedDishes: l.selectedDishes ?? null,
      answers: l.answers ?? null,
      notes: l.notes ?? null,

      path: l.path,
      sourcePage: l.sourcePage ?? null,
      landingPage: l.landingPage ?? null,
      referrer: l.referrer ?? null,
      waLocation: l.waLocation ?? null,
      sessionId: l.sessionId ?? null,
      utmSource: l.utmSource ?? null,
      utmMedium: l.utmMedium ?? null,
      utmCampaign: l.utmCampaign ?? null,
      utmTerm: l.utmTerm ?? null,
      utmContent: l.utmContent ?? null,
      utmId: l.utmId ?? null,
      firstTouchSource: l.firstTouchSource ?? null,
      firstTouchAt: l.firstTouchAt ?? null,
      touchCount: l.touchCount ?? null,

      gclid: l.gclid ?? null,
      gbraid: l.gbraid ?? null,
      wbraid: l.wbraid ?? null,
      fbclid: l.fbclid ?? null,
      msclkid: l.msclkid ?? null,
      ttclid: l.ttclid ?? null,
      clickIdCapturedAt: l.clickIdCapturedAt ?? null,

      gaClientId: l.gaClientId ?? null,
      gaSessionId: l.gaSessionId ?? null,

      waId: l.waId ?? null,
      waProfileName: l.waProfileName ?? null,
      ctwaClid: l.ctwaClid ?? null,
      firstInboundAt: l.firstInboundAt ?? null,
      firstReplyAt: l.firstReplyAt ?? null,

      consentMarketing: l.consentMarketing ?? false,
      consentMarketingAt: l.consentMarketingAt ?? null,
      consentAnalytics: l.consentAnalytics ?? null,
      consentAdUserData: l.consentAdUserData ?? null,
      consentTextVersion: l.consentTextVersion ?? null,
      noticeVersion: l.noticeVersion ?? null,
      unsubscribedAt: l.unsubscribedAt ?? null,
      unsubscribeToken: l.unsubscribeToken ?? null,

      status: l.status ?? "new",
      statusChangedAt: l.statusChangedAt ?? null,
      statusChangedBy: l.statusChangedBy ?? null,
      lostReason: l.lostReason ?? null,
      quotedValueIls: l.quotedValueIls ?? null,
      wonValueIls: l.wonValueIls ?? null,
      wonAt: l.wonAt ?? null,
      convertedAt: l.convertedAt ?? null,

      draftId: l.draftId ?? null,
      stepsCompleted: l.stepsCompleted ?? null,
      timeToCompleteMs: l.timeToCompleteMs ?? null,
      notifiedAt: l.notifiedAt ?? null,
      notifyAttempts: l.notifyAttempts ?? 0,
      escalatedAt: l.escalatedAt ?? null,
      adsUploadStatus: l.adsUploadStatus ?? null,
      adsUploadedAt: l.adsUploadedAt ?? null,
      gaMpUploadStatus: l.gaMpUploadStatus ?? null,
      isTest: l.isTest ?? false,
      duplicateOf: l.duplicateOf ?? null,
      purgeAfter: l.purgeAfter ?? null,

      createdAt: now,
      updatedAt: now,
    };
    this.leadRows.unshift(row);
    return row;
  }

  async updateLead(id: string, patch: Partial<InsertLead>) {
    const row = this.leadRows.find((r) => r.id === id);
    if (!row) return undefined;
    Object.assign(row, patch, { updatedAt: new Date() });
    return row;
  }

  async getLead(id: string) { return this.leadRows.find((r) => r.id === id); }
  async getLeadByRef(ref: string) { return this.leadRows.find((r) => r.ref === ref); }

  async findRecentLeadBySession(sessionId: string, withinMs: number) {
    const cutoff = Date.now() - withinMs;
    return this.leadRows.find(
      (r) => r.sessionId === sessionId && r.createdAt.getTime() > cutoff,
    );
  }

  async listLeads(q: LeadQuery = {}) {
    const filtered = q.status ? this.leadRows.filter((r) => r.status === q.status) : this.leadRows;
    return filtered.slice(q.offset ?? 0, (q.offset ?? 0) + (q.limit ?? 200));
  }

  async upsertDraft(d: InsertQuoteDraft): Promise<QuoteDraft> {
    const now = new Date();
    const prev = this.draftRows.get(d.draftId);
    const row: QuoteDraft = {
      draftId: d.draftId,
      sessionId: d.sessionId ?? null,
      step: d.step ?? 1,
      eventType: d.eventType ?? null,
      guestBand: d.guestBand ?? null,
      eventDate: d.eventDate ?? null,
      area: d.area ?? null,
      serviceFormat: d.serviceFormat ?? null,
      selectedDishes: d.selectedDishes ?? null,
      sourcePage: d.sourcePage ?? null,
      utmSource: d.utmSource ?? null,
      utmCampaign: d.utmCampaign ?? null,
      upgradedLeadId: d.upgradedLeadId ?? null,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };
    this.draftRows.set(d.draftId, row);
    return row;
  }

  async getDraft(draftId: string) { return this.draftRows.get(draftId); }

  async logLeadEvent(e: InsertLeadEvent): Promise<LeadEvent> {
    const row: LeadEvent = {
      id: crypto.randomUUID(),
      leadId: e.leadId,
      eventName: e.eventName,
      payload: e.payload ?? null,
      createdAt: new Date(),
    };
    this.eventRows.unshift(row);
    return row;
  }

  async getLeadEvents(leadId: string) {
    return this.eventRows.filter((e) => e.leadId === leadId);
  }

  async createBlogPost(p: InsertBlogPost): Promise<BlogPost> {
    const now = new Date();
    const row: BlogPost = {
      id: this.seq.post++,
      title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
      imageUrl: p.imageUrl ?? null, category: p.category, tags: p.tags ?? null,
      published: p.published ?? now, createdAt: now, updatedAt: now,
    };
    this.posts.unshift(row);
    return row;
  }
  async getBlogPosts() { return [...this.posts]; }
  async getBlogPostBySlug(slug: string) { return this.posts.find((p) => p.slug === slug); }

  async createTestimonial(t: InsertTestimonial): Promise<Testimonial> {
    const row: Testimonial = {
      id: this.seq.quote++,
      name: t.name, eventType: t.eventType, rating: t.rating, content: t.content,
      imageUrl: t.imageUrl ?? null, eventDate: t.eventDate ?? null,
      featured: t.featured ?? false, createdAt: new Date(),
    };
    this.quotes.unshift(row);
    return row;
  }
  async getTestimonials() { return [...this.quotes]; }
  async getFeaturedTestimonials() { return this.quotes.filter((t) => t.featured); }

  async createGalleryItem(g: InsertGalleryItem): Promise<GalleryItem> {
    const row: GalleryItem = {
      id: this.seq.gallery++,
      title: g.title, description: g.description ?? null, imageUrl: g.imageUrl,
      category: g.category, eventType: g.eventType ?? null,
      featured: g.featured ?? false, createdAt: new Date(),
    };
    this.gallery.unshift(row);
    return row;
  }
  async getGalleryItems() { return [...this.gallery]; }
  async getFeaturedGalleryItems() { return this.gallery.filter((g) => g.featured); }
}

/* ═══════════════════ בדיקת זהות ═══════════════════ */

/**
 * מוודא ש־MemoryStorage כותב כל עמודה שקיימת בטבלת leads.
 * נקרא בעליית השרת במצב פיתוח — עמודה שנוספה לסכימה בלי שורה מקבילה
 * ב־createLead תתגלה מיד ולא בעוד חודש בפרודקשן.
 */
export async function assertLeadParity(): Promise<string[]> {
  const mem = new MemoryStorage();
  const row = await mem.createLead({ ref: "MM-AAAAAA", path: "quote_form" });
  const schemaCols = Object.keys(getTableColumns(leads)).sort();
  const memCols = Object.keys(row).sort();
  return schemaCols.filter((c) => !memCols.includes(c));
}

/* ═══════════════════ בחירה ═══════════════════ */

export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();
export const storageKind = hasDatabase ? "postgres" : "memory";
