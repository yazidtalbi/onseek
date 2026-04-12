"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { CategoryPreferences } from "@/components/settings/category-preferences";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.actions";
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Palette, 
  Phone, 
  Sparkles,
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SettingsContentProps {
  user: any;
  profile: any;
}

type SettingsTab = "profile" | "contact" | "interests" | "appearance" | "account" | "delete";

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const menuItems = [
    { id: "profile", label: "Edit Profile", icon: User },
    { id: "interests", label: "Interests", icon: Sparkles },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account & Security", icon: Lock },
    { id: "delete", label: "Delete Account", icon: Trash2, variant: "danger" as const },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      {/* Header - Inspired by image 1 */}
      <div className="flex items-center gap-4 mb-10">
        <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden border border-[#e5e7eb] flex-shrink-0 relative">
          {profile.avatar_url ? (
            <Image 
              src={profile.avatar_url} 
              alt={profile.username} 
              fill 
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-bold text-xl text-gray-500">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
            <span className="text-xl text-gray-300">/</span>
            <span className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    isActive 
                      ? "text-gray-900 font-bold" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                    item.variant === "danger" && !isActive && "hover:text-red-600 hover:bg-red-50"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {/* <Icon className={cn("h-4 w-4", isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")} /> */}
                    {item.label}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className={activeTab === "profile" ? "block" : "hidden"}>
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-6 border-b border-gray-100">
                <AvatarUpload profile={profile} />
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-lg font-bold text-gray-900">Public Profile</h2>
                  <p className="text-sm text-gray-500">This information will be displayed publicly.</p>
                </div>
              </div>
              <ProfileForm profile={profile} />
            </div>
          </div>

          <div className={activeTab === "interests" ? "block" : "hidden"}>
            <div className="space-y-6">
               <div className="space-y-1 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Interests & Categories</h2>
                <p className="text-sm text-gray-500">Pick categories you're interested in.</p>
              </div>
              <CategoryPreferences />
            </div>
          </div>

          <div className={activeTab === "appearance" ? "block" : "hidden"}>
            <div className="space-y-6">
              <div className="space-y-1 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-500">Customize how the application looks to you.</p>
              </div>
              <div className="p-4 border border-[#e5e7eb] rounded-xl bg-gray-50/50">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className={activeTab === "account" ? "block" : "hidden"}>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-1 pb-2">
                  <h2 className="text-lg font-bold text-gray-900">Account</h2>
                  <p className="text-sm text-gray-500">Manage your login email.</p>
                </div>
                <div className="p-5 border border-[#e5e7eb] rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Button variant="default" size="sm" className="rounded-full px-4 bg-[#7755FF] text-white hover:bg-[#6644EE] border-0">
                    Change Email
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1 pb-2">
                  <h2 className="text-lg font-bold text-gray-900">Security</h2>
                  <p className="text-sm text-gray-500">Keep your account secure.</p>
                </div>
                <div className="p-5 border border-[#e5e7eb] rounded-xl space-y-4 bg-gray-50/50">
                   <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700">Password</label>
                    <p className="text-sm text-gray-600">••••••••••••</p>
                  </div>
                  <Button variant="default" size="sm" className="rounded-full px-4 bg-[#7755FF] text-white hover:bg-[#6644EE] border-0">
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5e7eb]">
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost" className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full px-6">
                    Sign out of your account
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className={activeTab === "delete" ? "block" : "hidden"}>
             <div className="space-y-6">
              <div className="space-y-1 pb-4">
                <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
                <p className="text-sm text-gray-500">This action is permanent and cannot be undone.</p>
              </div>
              <div className="p-6 border border-red-100 rounded-xl bg-red-50/30 space-y-4">
                <p className="text-sm text-gray-700">
                  Once you delete your account, all of your profile, requests, and proposals will be permanently removed. 
                  Please be certain.
                </p>
                <Button variant="default" className="text-white hover:bg-red-700 transition-colors rounded-full px-6 bg-red-600 shadow-none border-0">
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
