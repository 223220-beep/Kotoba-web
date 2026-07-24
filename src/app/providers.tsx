"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useStore";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  useEffect(() => { fetchMe(); }, [fetchMe]);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000,
            gcTime:               5 * 60 * 1000,
            retry:                1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <I18nProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
