import { PublicFooter } from "@/components/layout/public-footer";

// The compare detail pages manage their own custom sticky topbar.
// This layout adds the shared public footer and comparison directory link cloud.

export default function CompareDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
