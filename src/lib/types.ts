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
  category: string;
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

