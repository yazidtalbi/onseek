import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-background/80 backdrop-blur md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/app" className="text-lg font-semibold text-primary">
          Onseek
        </Link>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/app/requests" className="text-foreground">
            My Requests
          </Link>
          <Link href="/app/submissions" className="text-foreground">
            Submissions
          </Link>
          <Button asChild variant="accent" size="sm">
            <Link href="/app/new">New Request</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

