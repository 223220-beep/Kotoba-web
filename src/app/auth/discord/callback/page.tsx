"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useStore";
import { api } from "@/lib/api";

export default function DiscordCallback() {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      router.push("/login?error=discord_no_code");
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(async ({ error }) => {
        if (error) {
          router.push("/login?error=discord_exchange_failed");
          return null;
        }
        const { data } = await supabase.auth.getSession();
        return data.session;
      })
      .then(async (session) => {
        if (!session) return;
        localStorage.setItem("kotoba_token", session.access_token);
        try {
          await api.auth.discord();
        } catch {}
        await fetchMe();
        router.push("/discover");
      });
  }, [router, fetchMe]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-kotoba-bg">
      <p className="text-kotoba-muted animate-pulse">Completando inicio de sesión...</p>
    </div>
  );
}
