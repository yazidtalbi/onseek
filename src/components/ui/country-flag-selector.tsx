"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Globe } from "lucide-react";
// @ts-ignore - react-select-country-list doesn't have type definitions
import countryListFactory from "react-select-country-list";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Norway",
  "Denmark",
  "Belgium",
];

export function CountryFlagSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get("country") || null;
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter countries based on search query and separate popular ones
  const { popularCountries, otherCountries } = React.useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const allFiltered = searchQuery
      ? countryLabels.filter((country) =>
          country.toLowerCase().includes(lowerQuery)
        )
      : countryLabels;

    const popular = allFiltered.filter((country) =>
      POPULAR_COUNTRIES.includes(country)
    );
    const other = allFiltered.filter(
      (country) => !POPULAR_COUNTRIES.includes(country)
    );

    return { popularCountries: popular, otherCountries: other };
  }, [searchQuery]);

  // Reset search when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSelectCountry = (country: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (country === selectedCountry || country === "") {
      params.delete("country");
    } else {
      params.set("country", country);
    }
    // Reset to page 1 when filter changes
    params.delete("page");
    router.push(`/app?${params.toString()}`);
    setOpen(false);
  };

  const selectedCountryCode = selectedCountry ? getCountryCode(selectedCountry) : null;
  const hasResults = popularCountries.length > 0 || otherCountries.length > 0;

  const renderCountryItem = (country: string) => {
    const countryCode = getCountryCode(country);
    const isSelected = selectedCountry === country;
    return (
      <button
        key={country}
        type="button"
        onClick={() => handleSelectCountry(country)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
          "hover:bg-gray-100 cursor-pointer",
          isSelected && "bg-gray-100"
        )}
      >
        {countryCode ? (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm border border-gray-200">
            <Image
              src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
              alt={country}
              width={20}
              height={15}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
        )}
        <span className="flex-1 text-left">{country}</span>
        <Check
          className={cn(
            "h-4 w-4 flex-shrink-0",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </button>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
        title={selectedCountry || "Select country"}
      >
        {selectedCountryCode ? (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm border border-gray-200">
            <Image
              src={`https://flagcdn.com/w20/${selectedCountryCode.toLowerCase()}.png`}
              alt={selectedCountry || ""}
              width={20}
              height={15}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <Globe className="h-4 w-4 flex-shrink-0" />
        )}
        {selectedCountry && (
          <span className="hidden sm:inline text-xs text-gray-600 max-w-[100px] truncate">
            {selectedCountry}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
          {/* Globe icon at top right */}
          <div className="absolute top-4 right-4 z-10">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1 flex flex-col min-h-0 pt-6">
            {/* Search Input */}
            <div className="px-6 pb-4">
              <Input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {hasResults ? (
                <div className="space-y-0">
                  {/* All Countries option */}
                  <button
                    type="button"
                    onClick={() => handleSelectCountry("")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                      "hover:bg-gray-100 cursor-pointer",
                      !selectedCountry && "bg-gray-100"
                    )}
                  >
                    <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="flex-1 text-left">All Countries</span>
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        !selectedCountry ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                  
                  {/* Popular Countries Group */}
                  {popularCountries.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Popular
                      </div>
                      {popularCountries.map(renderCountryItem)}
                    </>
                  )}
                  
                  {/* Other Countries */}
                  {otherCountries.length > 0 && (
                    <>
                      {popularCountries.length > 0 && (
                        <div className="h-px bg-gray-200 my-1" />
                      )}
                      {!searchQuery && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          All Countries
                        </div>
                      )}
                      {otherCountries.map(renderCountryItem)}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

