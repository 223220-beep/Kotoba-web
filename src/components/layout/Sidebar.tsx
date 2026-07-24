"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Compass,
  Home,
  Library,
  PenTool,
  Search,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { useUIStore } from "@/stores/useStore";

const navItems = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Descubrir", href: "/discover", icon: Compass },
  { name: "Tendencias", href: "/trending", icon: TrendingUp },
  { name: "Búsqueda", href: "/search", icon: Search },
  { name: "Escribir", href: "/write", icon: PenTool },
];

const libraryItems = [
  { name: "Mi Biblioteca", href: "/library", icon: Library },
  { name: "Mis Manuscritos", href: "/dashboard/manuscripts", icon: PenTool },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-kotoba-border bg-kotoba-bg transition-all duration-300",
          "lg:flex",
          sidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 lg:w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-kotoba-border px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarCollapsed(true)}>
            <BookOpen className="h-6 w-6 text-kotoba-gold shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-display text-xl font-bold tracking-wider text-kotoba-text hidden lg:inline">
                KOTOBA<span className="text-kotoba-gold">.</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="lg:hidden text-kotoba-muted hover:text-kotoba-text p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarCollapsed(true)}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-kotoba-gold/10 text-kotoba-gold-light"
                      : "text-kotoba-muted hover:bg-kotoba-surface hover:text-kotoba-text",
                    sidebarCollapsed ? "justify-center lg:justify-center" : "justify-start"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0",
                      sidebarCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3",
                      isActive ? "text-kotoba-gold" : "text-kotoba-muted group-hover:text-kotoba-text"
                    )}
                  />
                  {!sidebarCollapsed && <span className="hidden lg:inline">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 px-6 text-xs font-semibold uppercase tracking-wider text-kotoba-muted hidden lg:block">
              Tus Obras
            </div>
          )}

          <nav className="mt-2 space-y-1 px-3">
            {libraryItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarCollapsed(true)}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-kotoba-gold/10 text-kotoba-gold-light"
                      : "text-kotoba-muted hover:bg-kotoba-surface hover:text-kotoba-text",
                    sidebarCollapsed ? "justify-center lg:justify-center" : "justify-start"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0",
                      sidebarCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3",
                      isActive ? "text-kotoba-gold" : "text-kotoba-muted group-hover:text-kotoba-text"
                    )}
                  />
                  {!sidebarCollapsed && <span className="hidden lg:inline">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-kotoba-border p-4">
          <Link
            href="/settings"
            onClick={() => setSidebarCollapsed(true)}
            className={cn(
              "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-kotoba-muted transition-colors hover:bg-kotoba-surface hover:text-kotoba-text",
              sidebarCollapsed ? "justify-center lg:justify-center" : "justify-start"
            )}
            title={sidebarCollapsed ? "Configuración" : undefined}
          >
            <Settings
              className={cn(
                "flex-shrink-0 text-kotoba-muted group-hover:text-kotoba-text",
                sidebarCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
              )}
            />
            {!sidebarCollapsed && <span className="hidden lg:inline">Configuración</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
