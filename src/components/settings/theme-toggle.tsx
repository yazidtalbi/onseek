"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Appearance</Label>
        <p className="text-xs text-muted-foreground">
          Choose between light and dark theme
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="flex items-center gap-2"
      >
        {theme === "dark" ? (
          <>
            <Sun className="h-4 w-4" />
            Light mode
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            Dark mode
          </>
        )}
      </Button>
    </div>
  );
}

