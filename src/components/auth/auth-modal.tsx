"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { ShieldCheck, Sparkles, LockKeyhole, Crown, X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  title = "Almost there!",
  description = "Sign in or create an account to get started and explore all the features Onseek has to offer."
}: AuthModalProps) {
  const [authMode, setAuthMode] = React.useState<'signup' | 'login'>('signup');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden rounded-[1.5rem] border-none shadow-2xl bg-white sm:max-w-[880px] w-full">
        {/* Contextual Close Button to match Request Creation Modal */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-[60] p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-10 pt-10 pb-4 w-full">
          <div className="flex flex-col md:flex-row gap-12 items-stretch w-full">
            {/* Left column: Forms */}
            <div className="w-full md:w-[400px] shrink-0 space-y-6 pb-4">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1 text-left" style={{ fontFamily: 'var(--font-expanded)' }}>
                  {title}
                </h2>
                <p className="text-sm text-gray-500 text-pretty mt-4 leading-relaxed">
                  {description}
                </p>
              </div>
              
              {authMode === 'signup' ? (
                <div className="space-y-6">
                  <SignUpForm onSuccess={() => onOpenChange(false)} />
                  <p className="text-sm text-center text-gray-500">
                    Already using Onseek?{" "}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-[#7755FF] font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <SignInForm onSuccess={() => onOpenChange(false)} />
                  <p className="text-sm text-center text-gray-500">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="text-[#7755FF] font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Right column: Perks Section */}
            <div className="hidden md:flex flex-1 min-w-0">
              <div className="p-10 rounded-[1.5rem] bg-gray-50 h-full flex flex-col justify-center">
                <div className="mb-8 flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>Join the community</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: <ShieldCheck className="h-5 w-5 text-green-500" />, title: "Verified Sellers", desc: "Buy with confidence from vetted professionals." },
                    { icon: <Sparkles className="h-5 w-5 text-[#7755FF]" />, title: "Private Matches", desc: "Get exclusive offers for your specific request." },
                    { icon: <LockKeyhole className="h-5 w-5 text-orange-500" />, title: "Secure Deals", desc: "Your data and payments are always protected." },
                    { icon: <Crown className="h-5 w-5 text-yellow-500" />, title: "Premium Access", desc: "First-look at rare items before they hit the feed." }
                  ].map((perk, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 mt-0.5">{perk.icon}</div>
                      <div>
                        <p className="font-semibold text-[#222234] text-sm mb-0.5" style={{ fontFamily: 'var(--font-expanded)' }}>{perk.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-gray-200/50 flex items-center gap-4">
                  <div className="flex -space-x-3 items-center">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10 bg-cover bg-center"
                        style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=user${i + 20})` }} />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#7755FF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+</div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium tracking-tight">Joined by 50,000+ members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
