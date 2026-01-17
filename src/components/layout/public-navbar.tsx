import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Onseek
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-foreground">
            Log in
          </Link>
          <Button asChild variant="accent" size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

