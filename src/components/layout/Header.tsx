"use client";

import Link from "next/link";
import { Bell, Globe, Menu, Moon, Search, Sun, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore, useUIStore } from "@/stores/useStore";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useT } from "@/lib/i18n";

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const { theme, mode, setTheme } = useTheme();
  const { t, lang, setLang } = useT();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-kotoba-border bg-kotoba-bg px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {!mobileSearchOpen && (
          <>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-kotoba-muted hover:text-kotoba-text shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="font-display text-lg font-bold tracking-wider text-kotoba-text shrink-0 md:hidden">
              K<span className="text-kotoba-gold">.</span>
            </Link>
          </>
        )}

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex relative max-w-xs items-center">
          <Search className="absolute left-3 h-4 w-4 text-kotoba-muted" />
          <Input
            type="search"
            placeholder={t.search.placeholder}
            className="w-64 pl-9 rounded-full bg-kotoba-surface border-kotoba-border focus-visible:ring-kotoba-gold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile search */}
        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="flex md:hidden relative flex-1 items-center">
            <Search className="absolute left-3 h-4 w-4 text-kotoba-muted" />
            <Input
              ref={mobileSearchRef}
              type="search"
              placeholder={t.search.placeholder}
              className="w-full pl-9 pr-10 rounded-full bg-kotoba-surface border-kotoba-border focus-visible:ring-kotoba-gold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }} className="absolute right-3 text-kotoba-muted">
              <X className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 overflow-visible">
        {/* Mobile search toggle — hidden on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSearchOpen(true)}
          className={`text-kotoba-muted hover:text-kotoba-text md:hidden ${mobileSearchOpen ? "hidden" : ""}`}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Always visible buttons — not affected by mobileSearchOpen */}
        <div className={`flex items-center gap-1 sm:gap-2 ${mobileSearchOpen ? "hidden md:flex" : "flex"} relative z-50`} style={{display:'flex',opacity:1,visibility:'visible'}}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="text-kotoba-muted hover:text-kotoba-text font-medium text-xs"
          >
            <Globe className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{lang.toUpperCase()}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = mode === "dark" ? "light" : mode === "light" ? "system" : "dark";
              setTheme(next);
            }}
            className="text-kotoba-muted hover:text-kotoba-text"
          >
            {mode === "dark" ? <Moon className="h-5 w-5" /> : mode === "light" ? <Sun className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="text-kotoba-muted hover:text-kotoba-text">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full border border-kotoba-border overflow-hidden h-8 w-8 sm:h-9 sm:w-9">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-kotoba-muted" />
                  )}
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">{t.nav.login}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3">{t.nav.register}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
