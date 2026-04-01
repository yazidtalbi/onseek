"use client";

import * as React from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { completeOnboardingAction } from "@/actions/onboarding.actions";
import { cn } from "@/lib/utils";

export function OnboardingModal() {
  const { user, profile } = useAuth();
  const [step, setStep] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const [username, setUsername] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    // Determine if we need to show the modal
    if (user && profile && profile.onboarding_completed === false) {
      setIsOpen(true);
      if (!username) setUsername(profile.username || "");
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!username.trim() || username.length < 3) {
        setError("Le pseudo doit contenir au moins 3 caractères.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!country.trim()) {
        setError("Veuillez entrer votre pays.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      submitOnboarding();
    } else if (step === 4) {
      setIsOpen(false);
      window.location.reload(); // Hard reload to clear caching safely
    }
  };

  const handleSkipAvatar = () => {
    submitOnboarding();
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    setError("");
    const res = await completeOnboardingAction({
      username,
      country,
      avatar_url: avatarUrl || undefined,
    });

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
      // Go back to the step that caused the error (usually username)
      if (res.error.toLowerCase().includes("pseudo") || res.error.toLowerCase().includes("nom d'utilisateur")) {
        setStep(1);
      }
    } else {
      setIsSubmitting(false);
      setStep(4);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Limité à 5MB max.");
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

  // Prevent closing the modal before completion by disabling outside clicks and esc key.
  const handleOpenChange = (open: boolean) => {
    if (step === 4) {
      setIsOpen(open);
      if (!open) window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[480px] p-0 overflow-hidden outline-none bg-white gap-0 border-0 shadow-2xl rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => step !== 4 && e.preventDefault()}
      >
        {step < 4 && (
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-neutral-500">
              Étape {step} / 3 — {step === 3 ? "Avatar" : "Terminez la création de votre compte"}
            </h2>
          </div>
        )}
        
        {step === 4 && (
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-neutral-500">Configuration terminée</h2>
          </div>
        )}

        {/* Step 1: Username */}
        {step === 1 && (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">On y est presque !</h1>
            <p className="text-sm text-neutral-600 mb-6">Nous avons juste besoin de votre consentement pour continuer, et vous aurez besoin d'un pseudo.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold text-neutral-900 text-sm">Nom d'utilisateur</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Choisissez un pseudo"
                  className="h-11 rounded-xl bg-white focus-visible:ring-1 focus-visible:ring-neutral-300"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                />
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="pt-2">
                <p className="text-[13px] text-neutral-500 mb-4 leading-relaxed">
                  En sélectionnant Accepter et continuer, j'accepte les <a href="#" className="text-[#00B2A9] hover:underline">Conditions générales d'utilisation</a> et la <a href="#" className="text-[#00B2A9] hover:underline">Politique de confidentialité</a> de Onseek.
                </p>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNextStep}
                    className="bg-[#00B2A9] hover:bg-[#009a92] text-white rounded-full px-6 h-10 font-medium"
                  >
                    Accepter et continuer →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Country */}
        {step === 2 && (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">D'où venez-vous ?</h1>
            <p className="text-sm text-neutral-600 mb-6">Cela nous aide à personnaliser votre expérience et les requêtes locales.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country" className="font-semibold text-neutral-900 text-sm">Pays de résidence</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="country" 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)} 
                    placeholder="Ex: France, Canada..."
                    className="h-11 pl-10 rounded-xl bg-white focus-visible:ring-1 focus-visible:ring-neutral-300"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" className="text-neutral-500" onClick={() => setStep(1)}>Retour</Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-[#00B2A9] hover:bg-[#009a92] text-white rounded-full px-6 h-10 font-medium"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Avatar */}
        {step === 3 && (
          <div className="p-6 flex flex-col sm:flex-row gap-6">
            {/* Left side: Avatar Preview */}
            <div className="shrink-0 flex justify-center sm:justify-start">
              <div className="relative group">
                <Avatar className="h-28 w-28 border border-neutral-200">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-neutral-100 text-neutral-400">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00B2A9]" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side: Instructions and actions */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Montrez votre personnalité !</h1>
                <p className="text-sm text-neutral-600">Ajoutez une touche personnelle à votre profil en téléchargeant une photo de profil. Nous vous recommandons d'utiliser une image carrée.</p>
              </div>
              
              <div>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline" 
                  className="text-[#00B2A9] border-[#00B2A9] hover:bg-[#00B2A9]/5 rounded-full px-5 h-9 font-medium"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={isUploading || isSubmitting}
                >
                  {avatarUrl ? "Remplacer l'image" : "Télécharger l'image"}
                </Button>
              </div>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex justify-end gap-3 pt-6">
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:bg-neutral-100 rounded-full h-10 px-5 font-medium"
                  onClick={handleSkipAvatar}
                  disabled={isUploading || isSubmitting}
                >
                  Passer
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={isUploading || isSubmitting}
                  className="bg-[#00B2A9] hover:bg-[#009a92] text-white rounded-full px-6 h-10 font-medium"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Welcome */}
        {step === 4 && (
          <div className="p-6 flex flex-col sm:flex-row gap-6">
            {/* Left side: Avatar Preview */}
            <div className="shrink-0 flex justify-center sm:justify-start">
              <Avatar className="h-28 w-28 border border-neutral-200">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-neutral-100 text-neutral-400">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
               
            {/* Right side */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">Bienvenue {username} !</h1>
                <p className="text-[15px] text-neutral-900 mb-4">
                  Vous pourrez changer votre pseudo et votre avatar plus tard dans les paramètres de votre compte.
                </p>
                <p className="text-[15px] text-neutral-900">
                  C'est tout bon. Bienvenue parmi nous ! L'équipe de Onseek est là si vous avez des questions.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextStep}
                  className="bg-[#00B2A9] hover:bg-[#009a92] text-white rounded-full px-6 h-10 font-medium"
                >
                  Terminé !
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
