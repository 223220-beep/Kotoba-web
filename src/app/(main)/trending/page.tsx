"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Flame } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";

export default function TrendingPage() {
  usePageTitle("Tendencias / Trending");
  const { data: works, isLoading } = useQuery({
    queryKey: ["works", "trending"],
    queryFn: () => api.works.getAll(),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="h-12 skeleton w-64 rounded-xl"></div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 skeleton rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const allWorks = works || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-kotoba-border pb-6">
        <div className="h-12 w-12 rounded-xl bg-kotoba-coral/10 flex items-center justify-center border border-kotoba-coral/20">
          <TrendingUp className="h-6 w-6 text-kotoba-coral" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-kotoba-text">Tendencias Globales</h1>
          <p className="text-kotoba-muted text-sm mt-1">Las obras más leídas y valoradas del momento.</p>
        </div>
      </div>

      <div className="space-y-4">
        {allWorks.map((work, index) => (
          <Card key={work.id} className="hover:border-kotoba-gold/50 transition-colors cursor-pointer group flex overflow-hidden">
            <div className="w-16 md:w-24 bg-kotoba-surface flex items-center justify-center border-r border-kotoba-border shrink-0 relative">
              {index < 3 && (
                <div className="absolute top-2 left-2">
                  <Flame className={`h-4 w-4 ${index === 0 ? "text-red-500" : index === 1 ? "text-orange-500" : "text-yellow-500"}`} />
                </div>
              )}
              <span className={`font-display text-4xl font-bold ${index < 3 ? "text-kotoba-gold" : "text-kotoba-muted/30"}`}>
                {index + 1}
              </span>
            </div>

            <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={index < 3 ? "gold" : "outline"} className="text-[10px] uppercase">
                    {work.genres?.[0] || ""}
                  </Badge>
                  {work.status === "ongoing" && <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">En emisión</Badge>}
                </div>

                <div>
                  <Link href={`/works/${work.id}`}>
                    <h3 className="text-xl font-bold text-kotoba-text group-hover:text-kotoba-gold transition-colors line-clamp-1">
                      {work.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-kotoba-muted mt-1">
                    Por <Link href={`/authors/${work.authorId}`} className="hover:text-kotoba-text transition-colors">{work.authorName || "Autor"}</Link>
                  </p>
                </div>

                <p className="text-sm text-kotoba-text/80 line-clamp-2 mt-2 max-w-2xl">
                  {work.synopsis}
                </p>
              </div>

              <div className="flex md:flex-col gap-4 md:gap-2 text-xs text-kotoba-muted shrink-0 md:text-right border-t md:border-t-0 border-kotoba-border pt-3 md:pt-0">
                <span className="flex items-center md:justify-end gap-1">
                  ⭐ <span className="font-medium text-kotoba-text">{work.rating?.toFixed(1) || "N/A"}</span>
                </span>
                <span className="flex items-center md:justify-end gap-1">
                  👁️ <span className="font-medium text-kotoba-text">{(work.viewCount || 0).toLocaleString()}</span>
                </span>
                <span className="flex items-center md:justify-end gap-1">
                  <BookOpen className="h-3 w-3" /> <span className="font-medium text-kotoba-text">{work.chapterCount || 0}</span> caps
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
