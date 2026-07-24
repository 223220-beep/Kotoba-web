"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api";
import { TrendingUp, Flame, Star, Users, ChevronRight, BookOpen } from "lucide-react";
import { useT } from "@/lib/i18n";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Home() {
  usePageTitle("Inicio / Home");
  const { t } = useT();
  const { data: works } = useQuery({
    queryKey: ["works", "featured"],
    queryFn: () => api.works.getAll(),
  });

  const { data: newAuthors } = useQuery({
    queryKey: ["newAuthors"],
    queryFn: () => api.users.getNewAuthors(),
  });

  const allWorks = works || [];
  const featuredWorks = allWorks.slice(0, 3);
  const trendingWorks = allWorks.slice(0, 8);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-kotoba-hero p-8 sm:p-12 border border-kotoba-border">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="gold" className="mb-4">{t.hero.badge}</Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-kotoba-text">
            {t.hero.title.split("<gold>").map((part, i) =>
              i === 1 ? <span key={i} className="text-kotoba-gold">{part.split("</gold>")[0]}</span> : part
            )}
          </h1>
          <p className="text-lg text-kotoba-muted md:text-xl">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/discover">
              <Button size="lg" className="w-full sm:w-auto">{t.hero.cta_read}</Button>
            </Link>
            <Link href="/dashboard/manuscripts">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">{t.hero.cta_publish}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tendencias */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-kotoba-coral/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-kotoba-coral" />
            </div>
            <h2 className="font-display text-2xl font-bold text-kotoba-text">{t.home.trending}</h2>
          </div>
          <Link href="/trending">
            <Button variant="link" className="text-sm gap-1">
              {t.home.view_ranking} <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
          {trendingWorks.map((work, i) => (
            <Link key={work.id} href={`/works/${work.id}`} className="snap-start shrink-0">
              <Card className="w-56 hover:border-kotoba-gold/50 transition-all hover:-translate-y-1 group">
                <div className="aspect-[2/3] bg-kotoba-elevated rounded-t-xl flex items-center justify-center border-b border-kotoba-border relative overflow-hidden">
                  {work.coverUrl ? (
                    <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-kotoba-muted/50" />
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-kotoba-bg/80 backdrop-blur rounded-full px-2 py-0.5 text-xs font-bold text-kotoba-gold">
                    <Flame className="h-3 w-3" /> #{i + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur rounded-md px-2 py-0.5 text-xs text-white">
                    ⭐ {work.rating?.toFixed(1) || "N/A"}
                  </div>
                </div>
                <CardHeader className="p-3">
                  <Badge variant="secondary" className="w-fit text-[10px] mb-1">{work.genres?.[0] || ""}</Badge>
                  <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-kotoba-gold transition-colors">
                    {work.title}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">{work.authorName || "Autor"}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Obras Destacadas */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-kotoba-gold/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-kotoba-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold text-kotoba-text">{t.home.featured}</h2>
          </div>
          <Link href="/discover">
            <Button variant="link" className="text-sm gap-1">
              {t.home.view_all} <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredWorks.map((work) => (
            <Link key={work.id} href={`/works/${work.id}`}>
              <Card className="hover:shadow-card-hover hover:border-kotoba-gold/30 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={work.status === "ongoing" ? "gold" : "secondary"}>
                      {work.status === "ongoing" ? "En Emisión" : work.status === "completed" ? "Completada" : work.status}
                    </Badge>
                    <span className="text-xs text-kotoba-muted capitalize">{work.genres?.[0] || ""}</span>
                  </div>
                  <CardTitle className="group-hover:text-kotoba-gold transition-colors">
                    {work.title}
                  </CardTitle>
                  <CardDescription>Por {work.authorName || "Autor"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-kotoba-text line-clamp-3">
                    {work.synopsis}
                  </p>
                  <div className="flex gap-4 mt-4 text-xs text-kotoba-muted">
                    <span>👁️ {(work.viewCount || 0).toLocaleString()}</span>
                    <span>⭐ {work.rating?.toFixed(1) || "N/A"}</span>
                    <span>📑 {work.chapterCount || 0} caps</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Nuevos Autores */}
      {newAuthors && newAuthors.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-kotoba-text">{t.home.new_authors}</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
            {newAuthors.map((author) => (
              <Link key={author.id} href={`/authors/${author.username}`} className="snap-start shrink-0">
                <div className="flex flex-col items-center gap-2 w-28 hover:-translate-y-1 transition-transform">
                  <div className="h-20 w-20 rounded-full bg-kotoba-surface border-2 border-kotoba-border hover:border-kotoba-gold/50 transition-colors flex items-center justify-center overflow-hidden">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.username} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-kotoba-gold">
                        {author.username?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-kotoba-text text-center truncate w-full">{author.username}</p>
                  <p className="text-xs text-kotoba-muted text-center truncate w-full">{author.country || t.misc.new_author}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
