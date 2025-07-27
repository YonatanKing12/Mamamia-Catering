import { ContactSubmission, InsertContactSubmission, BlogPost, InsertBlogPost, Testimonial, InsertTestimonial, GalleryItem, InsertGalleryItem } from "@shared/schema";
import { contactSubmissions, blogPosts, testimonials, galleryItems } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // Blog posts
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  
  // Testimonials
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  
  // Gallery items
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByCategory(category: string): Promise<GalleryItem[]>;
  getFeaturedGalleryItems(): Promise<GalleryItem[]>;
}

export class DatabaseStorage implements IStorage {
  // Contact submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [result] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return result;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  // Blog posts
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return result;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.published));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [result] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return result;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [result] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return result;
  }

  // Testimonials
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [result] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return result;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt));
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt));
  }

  // Gallery items
  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [result] = await db
      .insert(galleryItems)
      .values(item)
      .returning();
    return result;
  }

  async getGalleryItems(): Promise<GalleryItem[]> {
    return await db
      .select()
      .from(galleryItems)
      .orderBy(desc(galleryItems.createdAt));
  }

  async getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
    return await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.category, category))
      .orderBy(desc(galleryItems.createdAt));
  }

  async getFeaturedGalleryItems(): Promise<GalleryItem[]> {
    return await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.featured, true))
      .orderBy(desc(galleryItems.createdAt));
  }
}

export const storage = new DatabaseStorage();
