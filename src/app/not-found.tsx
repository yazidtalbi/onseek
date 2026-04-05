import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";
import { SidebarProvider } from "@/components/layout/app-sidebar";

export default function NotFound() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background w-full">
        <AppNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-12">
          <div className="mb-6 animate-in fade-in zoom-in duration-500">
            <Image
              src="/images/404-cat.png"
              alt="404 Cat Illustration"
              width={180}
              height={180}
              priority
              className="mx-auto"
            />
          </div>
          <span className="text-4xl font-semibold text-[#222234] mb-4">404</span>
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#222234] mb-8" 
            style={{ fontFamily: 'var(--font-expanded)' }}
          >
            Uh oh. This page doesn't exist.
          </h1>
          
          <Link href="/">
            <Button className="h-12 px-8 rounded-full bg-[#1c1f26] hover:bg-[#2c313a] text-white font-medium text-base transition-all">
              Back to home
            </Button>
          </Link>

          <div className="mt-12 space-y-2">
            <p className="text-lg text-gray-600 font-medium">
              Not finding what you're looking for?
            </p>
            <Link 
              href="/?create=true" 
              className="text-lg font-semibold text-[#7755FF] hover:underline transition-all"
            >
              Start a request
            </Link>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
