"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useStore";
import { api } from "@/lib/api";

export default function DiscordCallback() {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const handled = useRef(false);
  const [status, setStatus] = useState("Completando inicio de sesión...");

  useEffect(() => {
    let cancelled = false;

    const finish = async (accessToken: string) => {
      if (handled.current) return;
      handled.current = true;
      setStatus("Guardando sesión...");
      localStorage.setItem("kotoba_token", accessToken);
      try {
        await api.auth.discord();
      } catch {}
      await fetchMe();
      if (!cancelled) router.push("/discover");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          finish(session.access_token);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session && !handled.current) {
        finish(session.access_token);
      }
    });

    const timeout = setTimeout(() => {
      if (!handled.current && !cancelled) {
        setStatus("Tiempo de espera agotado. Redirigiendo...");
        router.push("/login?error=discord_timeout");
      }
    }, 15000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, fetchMe]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-kotoba-bg">
      <p className="text-kotoba-muted animate-pulse">{status}</p>
    </div>
  );
}
