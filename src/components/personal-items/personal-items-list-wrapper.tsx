"use client";

import { PersonalItemsList } from "./personal-items-list";
import { useQuery } from "@tanstack/react-query";
import { getSavedPersonalItemsAction } from "@/actions/saved-items.actions";
import type { PersonalItem } from "@/lib/types";

interface PersonalItemsListWrapperProps {
  initialItems: PersonalItem[];
}

export function PersonalItemsListWrapper({ initialItems }: PersonalItemsListWrapperProps) {
  const { data } = useQuery({
    queryKey: ["personal-items"],
    queryFn: async () => {
      const result = await getSavedPersonalItemsAction();
      if ("error" in result) {
        return initialItems;
      }
      return result.data || [];
    },
    initialData: initialItems,
    staleTime: 0,
  });

  return <PersonalItemsList initialItems={data || []} />;
}

