import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonalItemsListWrapper } from "@/components/personal-items/personal-items-list-wrapper";
import { AddItemModal } from "@/components/personal-items/add-item-modal";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/app/inventory");
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
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your saved personal items. Use them when submitting to requests.
          </p>
        </div>
        <AddItemModal />
      </div>

      <PersonalItemsListWrapper initialItems={items || []} />
    </div>
  );
}

