import { type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
}

export class MemStorage implements IStorage {
  private contactSubmissions: Map<string, ContactSubmission>;

  constructor() {
    this.contactSubmissions = new Map();
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = { 
      ...insertSubmission,
      email: insertSubmission.email || null,
      guestCount: insertSubmission.guestCount || null,
      eventDate: insertSubmission.eventDate || null,
      budget: insertSubmission.budget || null,
      details: insertSubmission.details || null,
      id,
      createdAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
}

export const storage = new MemStorage();
