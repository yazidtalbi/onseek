import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mx-auto w-full max-w-lg border-border bg-white/80">
      <CardContent className="space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

