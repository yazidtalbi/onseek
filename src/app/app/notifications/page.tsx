import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-white/80 p-6">
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay updated on wins, votes, and new activity.
        </p>
      </div>

      <div className="space-y-4">
        {notifications?.length ? (
          notifications.map((item) => (
            <Card key={item.id} className="border-border bg-white/80">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-semibold">{item.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={item.read ? "outline" : "muted"}>
                  {item.read ? "Read" : "New"}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white/50 p-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}

