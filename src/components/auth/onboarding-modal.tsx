"use client";

import * as React from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, User, Check, Globe, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { completeOnboardingAction } from "@/actions/onboarding.actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
// @ts-ignore - react-select-country-list doesn't have type definitions
import countryListFactory from "react-select-country-list";

// Initialize country list
const countryList = countryListFactory();
const countryLabels: string[] = countryList.getLabels();

// Get country code from country name
function getCountryCode(countryName: string): string | null {
  try {
    const code = countryList.getValueByLabel(countryName);
    return code ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

// Popular countries to show at the top
const POPULAR_COUNTRIES = [
  "Morocco",
  "France",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Spain",
  "Italy",
];

export function OnboardingModal() {
  const { user, profile } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const [country, setCountry] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let url = null;
    if (profile?.avatar_url) {
      url = profile.avatar_url;
    } else if (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) {
      url = user.user_metadata.avatar_url || user.user_metadata.picture;
    }
    
    if (url && typeof url === "string") {
      url = url.trim();
      if (url.startsWith("//")) url = `https:${url}`;
      setAvatarUrl(url);
      setImageError(false); // Reset error when URL changes
    }
  }, [profile?.avatar_url, user?.user_metadata]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Only automatically OPEN the modal if not completed.
    // We don't automatically CLOSE it here because we want to let the user see the success step
    // even after the profile has been updated in the background.
    if (user && (!profile || profile?.onboarding_completed !== true)) {
      setIsOpen(true);
    }
  }, [user?.id, profile?.onboarding_completed]);

  // Filter countries based on search query
  const { popularCountries, otherCountries } = React.useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const allFiltered = searchQuery
      ? countryLabels.filter((c) => c.toLowerCase().includes(lowerQuery))
      : countryLabels;

    const popular = allFiltered.filter((c) => POPULAR_COUNTRIES.includes(c));
    const other = allFiltered.filter((c) => !POPULAR_COUNTRIES.includes(c));

    return { popularCountries: popular, otherCountries: other };
  }, [searchQuery]);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!country.trim()) {
        setError("Please select your country.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      submitOnboarding();
    } else if (step === 3) {
      setIsOpen(false);
    }
  };

  const handleSkipAvatar = () => {
    submitOnboarding();
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    setError("");
    const res = await completeOnboardingAction({
      username: profile?.username || user?.email?.split("@")[0] || "user",
      country,
      avatar_url: avatarUrl || undefined,
    });

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      setStep(3);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size limited to 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAvatarUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (step === 3) {
      setIsOpen(open);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[480px] p-0 overflow-hidden outline-none bg-white border-0 shadow-2xl rounded-[1.5rem]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => step !== 3 && e.preventDefault()}
      >
        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="p-8 pb-6 flex flex-col h-[580px]">
            <div className="mb-6">
              <h1 
                className="text-2xl font-bold text-[#222234] mb-2"
                style={{ fontFamily: 'var(--font-expanded)' }}
              >
                Where are you located?
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                This helps us show you the most relevant requests in your area. You can change this later in settings.
              </p>
            </div>
            
            <div className="relative mb-4 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#7755FF] transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Morocco, France..."
                className="h-12 pl-10 bg-gray-50 border-gray-100 rounded-xl focus-visible:ring-[#7755FF]/20 focus-visible:border-[#7755FF] transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
              {popularCountries.length > 0 && !searchQuery && (
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Popular</p>
              )}
              
              {[...popularCountries, ...otherCountries].map((c) => {
                const code = getCountryCode(c);
                const isSelected = country === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      isSelected 
                        ? "bg-[#7755FF]/5 text-[#7755FF] ring-1 ring-[#7755FF]/20" 
                        : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    {code ? (
                      <div className="w-5 h-5 relative rounded-sm overflow-hidden border border-gray-100 shrink-0">
                        <Image
                          src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                          alt={c}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="flex-1 text-sm font-medium">{c}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}

              {popularCountries.length === 0 && otherCountries.length === 0 && (
                <div className="py-12 text-center">
                  <Globe className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No countries found</p>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-500 mt-4">{error}</p>}

            <div className="pt-6 flex justify-end bg-gradient-to-t from-white via-white to-transparent">
              <Button 
                onClick={handleNextStep}
                disabled={!country}
                className={cn(
                  "h-12 px-10 rounded-full font-bold transition-all shadow-lg",
                  country 
                    ? "bg-[#222234] hover:bg-[#2a2a4f] text-white shadow-[#222234]/10" 
                    : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                )}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Avatar Upload */}
        {step === 2 && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="mb-8">
              <h1 
                className="text-2xl font-bold text-[#222234] mb-3"
                style={{ fontFamily: 'var(--font-expanded)' }}
              >
                Show your personality!
              </h1>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                Add a personal touch to your profile by uploading a photo. We recommend using a square image.
              </p>
            </div>
            
            <div className="relative mb-6">
              <div className="w-[120px] h-[120px] rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                {avatarUrl && !imageError ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#7755FF]" />
                  </div>
                )}
              </div>
              {avatarUrl && !isUploading && (
                <div className="absolute -bottom-1 -right-1 bg-[#00B2A9] text-white rounded-full p-1 border-2 border-white">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <Button 
                variant="outline" 
                className="h-11 px-8 rounded-full border-[#222234] text-[#222234] font-bold hover:bg-gray-50 w-fit"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={isUploading || isSubmitting}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {avatarUrl ? "Change Image" : "Upload Image"}
              </Button>
            </div>

            {error && <p className="text-sm text-rose-500 mt-4">{error}</p>}

            <div className="mt-12 w-full flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-gray-600 font-medium px-0"
                onClick={handleSkipAvatar}
                disabled={isUploading || isSubmitting}
              >
                Skip (Passer)
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={isUploading || isSubmitting || !avatarUrl}
                className={cn(
                  "h-12 px-10 rounded-full font-bold transition-all shadow-lg",
                  avatarUrl 
                    ? "bg-[#222234] hover:bg-[#2a2a4f] text-white shadow-[#222234]/10" 
                    : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                )}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next Step"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success / Welcome */}
        {step === 3 && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-[120px] h-[120px] rounded-full border-4 border-[#00B2A9]/10 p-1 mb-6 relative overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h1 
                className="text-2xl font-bold text-[#222234] mb-4"
                style={{ fontFamily: 'var(--font-expanded)' }}
              >
                Welcome to Onseek, {profile?.username || user?.email?.split("@")[0] || "User"}!
              </h1>
              <p className="text-[15px] text-gray-500 leading-relaxed px-4">
                You're all set. Welcome to the community! The Onseek team is here if you have any questions.
              </p>
            </div>

            <Button 
              onClick={handleNextStep}
              className="w-full h-14 rounded-full bg-[#7a61ff] hover:bg-[#6c51ef] text-white text-base font-bold shadow-xl shadow-[#7a61ff]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
