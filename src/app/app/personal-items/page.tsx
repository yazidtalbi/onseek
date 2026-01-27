import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonalItemsList } from "@/components/personal-items/personal-items-list";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PersonalItemsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/app/personal-items");
  }

  // Fetch user's personal items
  const { data: items, error } = await supabase
    .from("saved_personal_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching personal items:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Personal Items
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your saved personal items. Use them when submitting to requests.
          </p>
        </div>
        <Button asChild className="bg-[#7755FF] hover:bg-[#6644EE]">
          <Link href="/app/new">
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Link>
        </Button>
      </div>

      <PersonalItemsList initialItems={items || []} />
    </div>
  );
}

