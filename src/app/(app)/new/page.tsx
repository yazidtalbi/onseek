import { RequestForm } from "@/components/requests/request-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userCountry = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("country")
      .eq("id", user.id)
      .single();
    userCountry = profile?.country || null;
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <RequestForm userCountry={userCountry} />
    </div>
  );
}

