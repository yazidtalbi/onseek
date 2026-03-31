"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Bell, Check } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { NotificationItem } from "./notification-item";
import { markAllNotificationsReadAction } from "@/actions/notification.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotificationsDrawerProps {
  children: React.ReactNode;
}

export function NotificationsDrawer({ children }: NotificationsDrawerProps) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All");

  React.useEffect(() => {
    if (!open || !user) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
        
      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();
  }, [open, user]);

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;
    if (showUnreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }
    if (activeTab === "Messages") {
      filtered = filtered.filter((n) => n.type === "new_message");
    } else if (activeTab === "System") {
      filtered = filtered.filter((n) => n.type !== "new_message");
    }
    return filtered;
  }, [notifications, showUnreadOnly, activeTab]);

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsReadAction();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        noBlur={true}
        className="w-full sm:w-[400px] sm:max-w-[400px] p-0 flex flex-col bg-white overflow-hidden shadow-2xl border-l border-neutral-200 rounded-none sm:rounded-none"
      >
        
        {/* Header matching the image */}
        <div className="flex flex-col border-b border-neutral-100 shrink-0 bg-white z-10">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Notifications</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-600">Unread</span>
                <Switch 
                  checked={showUnreadOnly} 
                  onCheckedChange={setShowUnreadOnly} 
                  className="data-[state=checked]:bg-[#7755FF]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 -mr-2 outline-none border-0 ring-0 focus-visible:ring-0">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-neutral-200">
                  <DropdownMenuItem 
                    onClick={handleMarkAllRead}
                    className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 px-3 py-2 outline-none"
                  >
                    Mark all as read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 mt-2 relative">
            {["All", "Messages", "System"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors relative",
                  activeTab === tab ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {tab}
                {/* Visual indicator for active tab similar to the ref image */}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-t-full" />
                )}
                {/* Example of indicator dot in 'All' tab from image */}
                {tab === "All" && notifications.some(n => !n.read) && (
                  <div className="absolute top-1 -right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 pb-10">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-6 w-6 border-2 border-neutral-300 border-t-[#7755FF] rounded-full" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
              <Bell className="h-10 w-10 text-neutral-300" />
              <div>
                <p className="text-sm font-medium text-neutral-900">No notifications</p>
                <p className="text-xs text-neutral-500 mt-1">You're all caught up!</p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div key={item.id} className="relative group">
                <NotificationItem notification={item} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-neutral-400 hover:text-neutral-900 bg-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
