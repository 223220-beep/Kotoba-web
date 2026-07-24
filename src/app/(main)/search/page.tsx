"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search as SearchIcon, Filter } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";

const QUICK_GENRES = ["Fantasía", "Ciencia Ficción", "Romance", "Thriller", "Ciberpunk", "Misterio", "Horror", "Drama"];

export default function SearchPage() {
  usePageTitle("Buscar / Search");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", activeQuery, activeGenre],
    queryFn: () => api.search.search(activeQuery, activeGenre || undefined),
    enabled: activeQuery.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
    setActiveGenre("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="text-center space-y-4 py-8">
        <h1 className="font-display text-4xl font-bold text-kotoba-text">Búsqueda Avanzada</h1>
        <p className="text-kotoba-muted max-w-lg mx-auto">
          Encuentra tu próxima lectura favorita por título, autor o género.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex gap-2 pt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kotoba-muted" />
            <Input
              placeholder="Buscar obras, autores, géneros..."
              className="pl-12 h-12 rounded-full text-base bg-kotoba-surface border-kotoba-gold/30 focus-visible:ring-kotoba-gold shadow-gold-glow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="rounded-full h-12 px-8">Buscar</Button>
        </form>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {QUICK_GENRES.map(genre => (
            <Badge
              key={genre}
              variant={activeGenre === genre ? "gold" : "secondary"}
              className="cursor-pointer hover:bg-kotoba-gold hover:text-kotoba-bg transition-colors"
              onClick={() => {
                setActiveGenre(genre === activeGenre ? "" : genre);
                setActiveQuery(genre);
              }}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 skeleton rounded-xl"></div>)}
        </div>
      ) : activeQuery && results?.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <SearchIcon className="h-12 w-12 text-kotoba-muted/50 mx-auto" />
          <h3 className="text-xl font-medium text-kotoba-text">No se encontraron resultados</h3>
          <p className="text-kotoba-muted">Intenta con otros términos o filtros más generales.</p>
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-6 pt-8 border-t border-kotoba-border">
          <h2 className="text-lg font-medium text-kotoba-text flex items-center gap-2">
            Resultados para <span className="text-kotoba-gold">"{activeQuery}"</span>
            <Badge variant="outline" className="ml-2 text-xs">{results.length} obras</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((work) => (
              <Card key={work.id} className="hover:border-kotoba-gold/50 transition-colors cursor-pointer group flex">
                <div className="w-1/3 bg-kotoba-elevated flex items-center justify-center border-r border-kotoba-border">
                  {work.coverUrl ? (
                    <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover rounded-l-xl" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-kotoba-muted/50" />
                  )}
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="gold" className="text-[10px]">{work.genres?.[0] || ""}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-kotoba-gold transition-colors">
                      <Link href={`/works/${work.id}`}>{work.title}</Link>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">Por {work.authorName || "Autor"}</CardDescription>
                  </div>
                  <div className="flex gap-3 text-xs text-kotoba-muted mt-4">
                    <span>⭐ {work.rating?.toFixed(1) || "N/A"}</span>
                    <span>📑 {work.chapterCount || 0} caps</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
