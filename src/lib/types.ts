export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  reputation: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_telegram?: string | null;
  contact_preferred?: "email" | "phone" | "whatsapp" | "telegram" | null;
};

export type RequestStatus = "open" | "closed" | "solved";

export type RequestItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string; // Legacy field, kept for backward compatibility
  budget_min: number | null;
  budget_max: number | null;
  country: string | null;
  condition: string | null;
  urgency: string | null;
  status: RequestStatus;
  winner_submission_id: string | null;
  created_at: string;
  updated_at: string;
  submissionCount?: number;
  // Personalization fields
  categories?: Category[];
  matchedCategories?: Category[];
  personalizationScore?: number;
  matchReason?: string;
};

export type Submission = {
  id: string;
  request_id: string;
  user_id: string;
  url: string;
  article_name: string | null;
  price: number | null;
  shipping_cost: number | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  score?: number | null;
  upvotes?: number | null;
  downvotes?: number | null;
  has_voted?: number | null;
};

// Personalization types
export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  created_at: string;
};

export type UserPreference = {
  user_id: string;
  category_id: string;
  weight: number;
  updated_at: string;
  category?: Category;
};

export type FeedMode = "for_you" | "latest" | "trending";

export type PersonalizedFeedResponse = {
  items: RequestItem[];
  nextCursor: string | null;
  hasMore: boolean;
  debug?: {
    matchedCategories?: string[];
    totalScored?: number;
    serendipityCount?: number;
  };
};

// Personal items types
export type PersonalItem = {
  id: string;
  user_id: string;
  article_name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};
