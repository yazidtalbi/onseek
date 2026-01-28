import { ReputationBadge } from "@/components/profile/badge";
import type { Profile } from "@/lib/types";

export function ProfileHeader({
  profile,
  solvedCount,
}: {
  profile: Profile;
  solvedCount: number;
}) {
  return (
    <div className="rounded-2xl  p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {profile.username}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <ReputationBadge reputation={profile.reputation || 0} />
      </div>
      {profile.bio ? (
        <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
      ) : null}
      <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
        <span>Reputation {profile.reputation ?? 0}</span>
        <span>Solved {solvedCount}</span>
      </div>
    </div>
  );
}

