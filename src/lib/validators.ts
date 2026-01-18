import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(24),
  displayName: z.string().min(2).max(40),
});

export const requestSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(40),
  budgetMin: z.number().min(0).nullable().optional(),
  budgetMax: z.number().min(0).nullable().optional(),
  priceLock: z.enum(["open", "locked"]).default("open"),
  exactItem: z.boolean().default(false),
  exactSpecification: z.boolean().default(false),
  exactPrice: z.boolean().default(false),
  country: z.string().min(2).max(60).nullable().optional(),
  condition: z.string().min(2).max(20).nullable().optional(),
  urgency: z.string().min(2).max(30).nullable().optional(),
  referenceLinks: z.string().optional(),
});

export const submissionSchema = z.object({
  submissionType: z.enum(["link", "personal"]),
  url: z.string().optional().nullable(),
  articleName: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() === "") return null;
      return val;
    },
    z.string().min(2).max(80).optional().nullable()
  ),
  price: z.number().min(0).optional().nullable(),
  notes: z.string().min(5).max(800).optional().nullable(),
}).refine((data) => {
  // URL is required and must be valid for link submissions
  if (data.submissionType === "link") {
    if (!data.url) {
      return false;
    }
    try {
      new URL(data.url);
      return true;
    } catch {
      return false;
    }
  }
  // For personal items, notes are required
  if (data.submissionType === "personal" && !data.notes) {
    return false;
  }
  return true;
}, {
  message: "URL is required and must be valid for link submissions, or description is required for personal items",
  path: ["url"],
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(40),
  username: z.string().min(3).max(24),
  bio: z.string().max(240).optional().nullable(),
});

export const reportSchema = z.object({
  reason: z.string().min(5).max(500),
});

