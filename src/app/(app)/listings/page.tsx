import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MyListingsView } from "@/components/personal-items/my-listings-view";
import { AddItemModal } from "@/components/personal-items/add-item-modal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/listings");
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
    <div className="w-full max-w-[1100px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start justify-center">
        {/* Left Column: Header */}
        <div className="w-full md:w-[280px] shrink-0 space-y-8 sticky top-24">
          <div>
            <h1 className="text-4xl text-foreground" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>My Listings</h1>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Manage your offerings. Save your favorite products and services to quickly reuse them when responding to marketplace requests.
            </p>
          </div>
          
          <div className="pt-2">
            <AddItemModal />
          </div>
        </div>

        {/* Right Column: Listings View (Client Component) */}
        <MyListingsView initialItems={items || []} />
      </div>
    </div>
  );
}

