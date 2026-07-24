"use client";

import { useUIStore } from "@/stores/useStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-w-0",
          "lg:ml-64",
          sidebarCollapsed && "lg:ml-20"
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
