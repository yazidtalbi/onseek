"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";

type Filters = {
  category?: string | null;
  status?: string | null;
  sort?: string | null;
  mine?: boolean;
  query?: string | null;
};

export function RequestFeed({
  initialRequests,
  filters,
}: {
  initialRequests: RequestItem[];
  filters: Filters;
}) {
  const { data } = useQuery({
    queryKey: ["requests", filters],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      let query = supabase.from("requests").select("*");

      if (filters.mine) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          query = query.eq("user_id", user.id);
        }
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }
      if (filters.query) {
        const safeQuery = filters.query.replace(/[%_]/g, "\\$&");
        query = query.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        );
      }
      if (filters.sort === "active") {
        query = query.order("updated_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: requests } = await query.limit(20);
      return requests ?? [];
    },
    initialData: initialRequests,
  });

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground">
        No requests yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

