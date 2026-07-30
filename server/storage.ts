/**
 * שכבת האחסון.
 *
 * שני מימושים מאחורי ממשק אחד:
 *   DatabaseStorage — Postgres דרך Drizzle. נבחר כשקיים DATABASE_URL.
 *   MemoryStorage   — בזיכרון התהליך. ברירת מחדל לפיתוח מקומי בלי הגדרות.
 *
 * MemoryStorage הוא מה שמאפשר `git clone && npm i && npm run dev` לעבוד
 * מיד. הוא נדיף — כל restart מאפס אותו — ולכן בפרודקשן חובה DATABASE_URL,
 * והשרת מזהיר על כך בעלייה.
 */

import {
  ContactSubmission, InsertContactSubmission,
  BlogPost, InsertBlogPost,
  Testimonial, InsertTestimonial,
  GalleryItem, InsertGalleryItem,
} from "@shared/schema";
import { contactSubmissions, blogPosts, testimonials, galleryItems } from "@shared/schema";
import { db, hasDatabase } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;

  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;

  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByCategory(category: string): Promise<GalleryItem[]>;
  getFeaturedGalleryItems(): Promise<GalleryItem[]>;
}

/* ═══════════════════════ Postgres ═══════════════════════ */

export class DatabaseStorage implements IStorage {
  /** db מוגדר כ־nullable ב־db.ts; המימוש הזה נבחר רק כשהוא קיים. */
  private get d() {
    if (!db) throw new Error("DatabaseStorage נבחר אך אין חיבור למסד נתונים");
    return db;
  }

  async createContactSubmission(submission: InsertContactSubmission) {
    const [result] = await this.d.insert(contactSubmissions).values(submission).returning();
    return result;
  }

  async getContactSubmissions() {
    return this.d.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createBlogPost(post: InsertBlogPost) {
    const [result] = await this.d.insert(blogPosts).values(post).returning();
    return result;
  }

  async getBlogPosts() {
    return this.d.select().from(blogPosts).orderBy(desc(blogPosts.published));
  }

  async getBlogPost(id: number) {
    const [result] = await this.d.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result;
  }

  async getBlogPostBySlug(slug: string) {
    const [result] = await this.d.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result;
  }

  async createTestimonial(testimonial: InsertTestimonial) {
    const [result] = await this.d.insert(testimonials).values(testimonial).returning();
    return result;
  }

  async getTestimonials() {
    return this.d.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getFeaturedTestimonials() {
    return this.d.select().from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async createGalleryItem(item: InsertGalleryItem) {
    const [result] = await this.d.insert(galleryItems).values(item).returning();
    return result;
  }

  async getGalleryItems() {
    return this.d.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
  }

  async getGalleryItemsByCategory(category: string) {
    return this.d.select().from(galleryItems)
      .where(eq(galleryItems.category, category))
      .orderBy(desc(galleryItems.createdAt));
  }

  async getFeaturedGalleryItems() {
    return this.d.select().from(galleryItems)
      .where(eq(galleryItems.featured, true))
      .orderBy(desc(galleryItems.createdAt));
  }
}

/* ═══════════════════════ זיכרון ═══════════════════════ */

export class MemoryStorage implements IStorage {
  private contacts: ContactSubmission[] = [];
  private posts: BlogPost[] = [];
  private quotes: Testimonial[] = [];
  private gallery: GalleryItem[] = [];
  private seq = { post: 1, quote: 1, gallery: 1 };

  private now() { return new Date(); }

  async createContactSubmission(s: InsertContactSubmission) {
    const row: ContactSubmission = {
      id: crypto.randomUUID(),
      name: s.name,
      phone: s.phone,
      email: s.email ?? null,
      eventType: s.eventType,
      guestCount: s.guestCount ?? null,
      eventDate: s.eventDate ?? null,
      budget: s.budget ?? null,
      details: s.details ?? null,
      createdAt: this.now(),
    };
    this.contacts.unshift(row);
    return row;
  }

  async getContactSubmissions() { return [...this.contacts]; }

  async createBlogPost(p: InsertBlogPost) {
    const row: BlogPost = {
      id: this.seq.post++,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl ?? null,
      category: p.category,
      tags: p.tags ?? null,
      published: p.published ?? this.now(),
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    this.posts.unshift(row);
    return row;
  }

  async getBlogPosts() { return [...this.posts]; }
  async getBlogPost(id: number) { return this.posts.find(p => p.id === id); }
  async getBlogPostBySlug(slug: string) { return this.posts.find(p => p.slug === slug); }

  async createTestimonial(t: InsertTestimonial) {
    const row: Testimonial = {
      id: this.seq.quote++,
      name: t.name,
      eventType: t.eventType,
      rating: t.rating,
      content: t.content,
      imageUrl: t.imageUrl ?? null,
      eventDate: t.eventDate ?? null,
      featured: t.featured ?? false,
      createdAt: this.now(),
    };
    this.quotes.unshift(row);
    return row;
  }

  async getTestimonials() { return [...this.quotes]; }
  async getFeaturedTestimonials() { return this.quotes.filter(t => t.featured); }

  async createGalleryItem(g: InsertGalleryItem) {
    const row: GalleryItem = {
      id: this.seq.gallery++,
      title: g.title,
      description: g.description ?? null,
      imageUrl: g.imageUrl,
      category: g.category,
      eventType: g.eventType ?? null,
      featured: g.featured ?? false,
      createdAt: this.now(),
    };
    this.gallery.unshift(row);
    return row;
  }

  async getGalleryItems() { return [...this.gallery]; }
  async getGalleryItemsByCategory(c: string) { return this.gallery.filter(g => g.category === c); }
  async getFeaturedGalleryItems() { return this.gallery.filter(g => g.featured); }
}

/* ═══════════════════════ בחירה ═══════════════════════ */

export const storage: IStorage = hasDatabase
  ? new DatabaseStorage()
  : new MemoryStorage();

export const storageKind = hasDatabase ? "postgres" : "memory";
