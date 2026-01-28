import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/notifications/notification-item";

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
    .limit(50);

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb]  p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay updated on wins, votes, and new activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-[#7755FF] text-white">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications?.length ? (
          notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e5e7eb]  p-8 text-center text-sm text-gray-600">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-base font-medium mb-2">No notifications yet</p>
            <p className="text-sm">You'll be notified when someone responds to your requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}

