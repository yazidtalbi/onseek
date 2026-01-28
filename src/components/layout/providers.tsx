"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TopLoadingBar } from "@/components/ui/top-loading-bar";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 minute - data stays fresh longer
            gcTime: 5 * 60 * 1000, // 5 minutes cache time (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
            refetchOnMount: false, // Use cached data if available
            retry: 1, // Retry once on error
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TopLoadingBar />
        {children}
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

