"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
// @ts-ignore - react-select-country-list doesn't have type definitions
import countryListFactory from "react-select-country-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Initialize country list - it's a factory function, not a class
const countryList = countryListFactory();
const countryLabels: string[] = countryList.getLabels();

export function CountryCombobox({
  value,
  onChange,
  placeholder = "Select or type country",
  className,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  // Filter countries based on input
  const filteredCountries = React.useMemo(() => {
    if (!inputValue) return countryLabels;
    const lowerInput = inputValue.toLowerCase();
    return countryLabels.filter((country) =>
      country.toLowerCase().includes(lowerInput)
    );
  }, [inputValue]);

  // Update input when value prop changes (from outside)
  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value || "");
    }
  }, [value]);

  const handleSelect = (country: string) => {
    setInputValue(country);
    onChange(country);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setOpen(true);
  };

  const selectedCountry = value || inputValue;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pr-20 pl-4"
        />
        {selectedCountry && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border border-[#e5e7eb] bg-white shadow-lg">
            {filteredCountries.length > 0 ? (
              <div className="p-1">
                {filteredCountries.map((country: string) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                      "hover:bg-gray-100 cursor-pointer",
                      selectedCountry === country && "bg-gray-100"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedCountry === country ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{country}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No countries found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
