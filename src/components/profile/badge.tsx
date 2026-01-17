import { Badge } from "@/components/ui/badge";

export function ReputationBadge({ reputation }: { reputation: number }) {
  let label = "Scout";
  if (reputation >= 200) label = "Expert";
  else if (reputation >= 80) label = "Hunter";

  return <Badge variant="muted">{label}</Badge>;
}

