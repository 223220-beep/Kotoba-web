"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, PenTool, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useStore";

const items = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/discover", icon: Compass, label: "Descubrir" },
  { href: "/library", icon: Library, label: "Biblioteca" },
  { href: "/write", icon: PenTool, label: "Escribir" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-kotoba-border bg-kotoba-bg/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          if (item.href === "/profile" && !isAuthenticated) {
            return (
              <Link
                key={item.href}
                href="/login"
                className="flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1"
              >
                <User className={cn("h-5 w-5", isActive ? "text-kotoba-gold" : "text-kotoba-muted")} />
                <span className="text-[10px] font-medium text-kotoba-muted truncate">Perfil</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1"
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-kotoba-gold" : "text-kotoba-muted")} />
              <span className={cn("text-[10px] font-medium truncate", isActive ? "text-kotoba-gold" : "text-kotoba-muted")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
