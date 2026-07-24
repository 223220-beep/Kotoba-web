"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Star, Flame, TrendingUp, Search, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { VALID_GENRES } from "@/lib/types";
import { usePageTitle } from "@/lib/usePageTitle";

export default function DiscoverPage() {
  usePageTitle("Descubrir / Discover");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allWorks, isLoading } = useQuery({
    queryKey: ["works", "all", selectedGenre],
    queryFn: () => api.works.getAll(selectedGenre ? { genre: selectedGenre } : undefined),
  });

  const works = allWorks || [];
  const featured = works[0];
  const filteredWorks = searchQuery
    ? works.filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.authorName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : works;
  const displayWorks = filteredWorks.length > 0 ? filteredWorks : works;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 skeleton w-64 rounded-xl"></div>
        <div className="h-10 skeleton w-full rounded-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-72 skeleton rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-kotoba-border pb-6">
        <div className="h-12 w-12 rounded-xl bg-kotoba-gold/10 flex items-center justify-center border border-kotoba-gold/20">
          <BookOpen className="h-6 w-6 text-kotoba-gold" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-kotoba-text">Descubrir</h1>
          <p className="text-kotoba-muted text-sm mt-1">Explora nuevas historias y autores.</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-kotoba-muted" />
        <input
          type="text"
          placeholder="Buscar obras o autores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-kotoba-elevated border border-kotoba-border rounded-full pl-11 pr-4 py-3 text-sm text-kotoba-text focus:outline-none focus:border-kotoba-gold focus:ring-1 focus:ring-kotoba-gold/30 transition-colors"
        />
      </div>

      {/* Genre filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            !selectedGenre
              ? "bg-kotoba-gold text-kotoba-bg border-kotoba-gold"
              : "bg-kotoba-elevated text-kotoba-muted border-kotoba-border hover:border-kotoba-gold/50"
          }`}
        >
          Todos
        </button>
        {VALID_GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              selectedGenre === genre
                ? "bg-kotoba-gold text-kotoba-bg border-kotoba-gold"
                : "bg-kotoba-elevated text-kotoba-muted border-kotoba-border hover:border-kotoba-gold/50"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Featured work */}
      {!searchQuery && !selectedGenre && featured && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-kotoba-gold" />
            <h2 className="font-display text-2xl font-bold text-kotoba-text">Obra Destacada</h2>
          </div>
          <Card className="overflow-hidden border-kotoba-gold/30 bg-kotoba-surface/50">
            <div className="md:flex">
              <div className="md:w-1/3 bg-kotoba-elevated flex items-center justify-center p-8 min-h-[200px] border-b md:border-b-0 md:border-r border-kotoba-border">
                {featured.coverUrl ? (
                  <img src={featured.coverUrl} alt={featured.title} loading="lazy" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <BookOpen className="h-16 w-16 text-kotoba-gold/50" />
                )}
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {featured.genres?.slice(0, 2).map(g => (
                      <Badge key={g} variant="gold" className="capitalize">{g}</Badge>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-bold text-kotoba-gold-light hover:underline cursor-pointer">
                      <Link href={`/works/${featured.id}`}>{featured.title}</Link>
                    </h3>
                    <p className="text-sm text-kotoba-muted mt-1">
                      Por <Link href={`/authors/${featured.authorId}`} className="hover:text-kotoba-text">{featured.authorName || "Autor"}</Link>
                    </p>
                  </div>
                  <p className="text-kotoba-text/90 line-clamp-3">{featured.synopsis}</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-kotoba-border">
                  <div className="flex gap-4 text-xs text-kotoba-muted">
                    <span>👁️ {(featured.viewCount || 0).toLocaleString()}</span>
                    <span>⭐ {featured.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <Link href={`/works/${featured.id}`}>
                    <Button>Leer ahora</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* All / Filtered works grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-kotoba-gold" />
          <h2 className="font-display text-2xl font-bold text-kotoba-text">
            {selectedGenre || (searchQuery ? "Resultados" : "Todas las obras")}
          </h2>
          <span className="text-sm text-kotoba-muted ml-2">({displayWorks.length})</span>
        </div>

        {displayWorks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-kotoba-muted/30 mx-auto mb-4" />
            <p className="text-kotoba-muted">No se encontraron obras con esos filtros.</p>
            <Button variant="link" onClick={() => { setSelectedGenre(null); setSearchQuery(""); }}>Limpiar filtros</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayWorks.map((work) => (
              <Link key={work.id} href={`/works/${work.id}`}>
                <Card className="hover:shadow-gold-glow-sm transition-shadow flex flex-col h-full group">
                  <div className="aspect-[2/3] bg-kotoba-elevated rounded-t-xl flex items-center justify-center border-b border-kotoba-border overflow-hidden relative">
                    {work.coverUrl ? (
                      <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-kotoba-muted/50" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur rounded-md px-2 py-0.5 text-xs text-white">
                      ⭐ {work.rating?.toFixed(1) || "N/A"}
                    </div>
                  </div>
                  <CardHeader className="flex-1 p-4">
                    <Badge variant="secondary" className="w-fit mb-2 text-[10px]">{work.genres?.[0] || ""}</Badge>
                    <CardTitle className="text-lg line-clamp-2 text-kotoba-text group-hover:text-kotoba-gold-light transition-colors">
                      {work.title}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">{work.authorName || "Autor"}</CardDescription>
                    <div className="flex gap-3 mt-2 text-xs text-kotoba-muted">
                      <span>👁️ {(work.viewCount || 0).toLocaleString()}</span>
                      <span>📑 {work.chapterCount || 0} cap</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
