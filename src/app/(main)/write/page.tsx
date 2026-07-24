"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PenTool, Layers, Plus, ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useStore";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/lib/usePageTitle";
import { useEffect } from "react";

export default function WriteDashboardPage() {
  usePageTitle("Escribir / Write");
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: works, isLoading } = useQuery({
    queryKey: ["manuscripts", user?.id],
    queryFn: () => api.works.getAll({ authorId: user!.id }),
    enabled: !!user?.id,
  });

  if (!user) return null;

  const sorted = (works || []).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const latest = sorted[0];
  const publishedCount = sorted.filter(w => w.status === "ongoing" || w.status === "completed" || w.status === "hiatus").length;
  const draftCount = sorted.filter(w => w.status === "draft").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-kotoba-text">Escribir</h1>
        <p className="text-kotoba-muted text-sm mt-1">Crea y gestiona tus historias</p>
      </div>

      {/* Continue Writing */}
      {latest && (
        <Link href={`/dashboard/manuscripts/${latest.id}/edit`}>
          <Card className="bg-gradient-to-br from-kotoba-surface to-kotoba-elevated border-kotoba-gold/30 hover:border-kotoba-gold/60 transition-all group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-14 bg-kotoba-elevated rounded border border-kotoba-border flex items-center justify-center shrink-0 overflow-hidden">
                  {latest.coverUrl ? (
                    <img src={latest.coverUrl} alt={latest.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-kotoba-muted/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-kotoba-gold" />
                    <span className="text-xs text-kotoba-gold font-medium">Continuar escribiendo</span>
                  </div>
                  <h2 className="text-lg font-bold text-kotoba-text group-hover:text-kotoba-gold transition-colors truncate">{latest.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-kotoba-muted mt-1">
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {latest.chapterCount || 0} caps</span>
                    <span className="flex items-center gap-1">{draftCount} borradores</span>
                    <span className="flex items-center gap-1">{publishedCount} publicados</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-kotoba-gold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/manuscripts">
          <Card className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-kotoba-elevated flex items-center justify-center group-hover:bg-kotoba-gold/10 transition-colors">
                <PenTool className="h-6 w-6 text-kotoba-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-kotoba-text">Historias</h3>
                <p className="text-sm text-kotoba-muted mt-1">
                  {publishedCount} publicadas, {draftCount} borradores
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-kotoba-muted group-hover:text-kotoba-gold transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group h-full opacity-60">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-kotoba-elevated flex items-center justify-center">
              <Layers className="h-6 w-6 text-kotoba-muted" />
            </div>
            <div>
              <h3 className="font-semibold text-kotoba-text">Series</h3>
              <p className="text-sm text-kotoba-muted mt-1">Agrupa tus historias</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Próximamente</Badge>
          </CardContent>
        </Card>

        <Link href="/dashboard/manuscripts/new/edit">
          <Card className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-kotoba-elevated flex items-center justify-center group-hover:bg-kotoba-gold/10 transition-colors">
                <Plus className="h-6 w-6 text-kotoba-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-kotoba-text">Crea una historia nueva</h3>
                <p className="text-sm text-kotoba-muted mt-1">Comienza desde cero</p>
              </div>
              <ArrowRight className="h-4 w-4 text-kotoba-muted group-hover:text-kotoba-gold transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      {sorted.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-kotoba-text mb-4">Actividad Reciente</h2>
          <div className="space-y-2">
            {sorted.slice(0, 5).map((w) => (
              <Link key={w.id} href={`/dashboard/manuscripts/${w.id}/edit`}>
                <div className="flex items-center justify-between p-3 border border-kotoba-border rounded-lg bg-kotoba-elevated hover:border-kotoba-gold/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-8 bg-kotoba-surface rounded flex items-center justify-center shrink-0 overflow-hidden">
                      {w.coverUrl ? (
                        <img src={w.coverUrl} alt={w.title} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-kotoba-muted/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-kotoba-text group-hover:text-kotoba-gold transition-colors truncate">{w.title}</p>
                      <p className="text-xs text-kotoba-muted">{w.chapterCount || 0} caps • {w.genres?.join(", ") || ""}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{w.status === "draft" ? "Borrador" : "Publicado"}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
