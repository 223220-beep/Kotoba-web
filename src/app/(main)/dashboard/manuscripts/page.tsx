"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Edit3, Trash2, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/useStore";
import { usePageTitle } from "@/lib/usePageTitle";

export default function ManuscriptsPage() {
  usePageTitle("Mis Manuscritos / Manuscripts");
  const [tab, setTab] = useState<"published" | "drafts">("published");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: works, isLoading } = useQuery({
    queryKey: ["manuscripts", user?.id],
    queryFn: () => api.works.getAll({ authorId: user!.id }),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.works.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      queryClient.invalidateQueries({ queryKey: ["works"] });
      setDeleteTarget(null);
    },
  });

  if (isLoading || !works) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="h-10 skeleton w-1/4 rounded"></div>
        <div className="flex gap-4">
          <div className="h-10 skeleton w-20 rounded-full"></div>
          <div className="h-10 skeleton w-20 rounded-full"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const published = works.filter(w => w.status === "ongoing" || w.status === "completed" || w.status === "hiatus");
  const drafts = works.filter(w => w.status === "draft");
  const displayed = tab === "published" ? published : drafts;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-kotoba-text">Mis Manuscritos</h1>
          <p className="text-kotoba-muted text-sm mt-1">Gestiona tus obras y capítulos</p>
        </div>
        <Link href="/dashboard/manuscripts/new/edit">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Crear Obra
          </Button>
        </Link>
      </div>

      <div className="flex gap-0 border-b border-kotoba-border">
        <button
          onClick={() => setTab("published")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "published"
              ? "border-kotoba-gold text-kotoba-gold"
              : "border-transparent text-kotoba-muted hover:text-kotoba-text"
          }`}
        >
          Publicadas ({published.length})
        </button>
        <button
          onClick={() => setTab("drafts")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "drafts"
              ? "border-kotoba-gold text-kotoba-gold"
              : "border-transparent text-kotoba-muted hover:text-kotoba-text"
          }`}
        >
          Borradores ({drafts.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayed.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-kotoba-border rounded-xl">
            <BookOpen className="h-12 w-12 text-kotoba-muted/50 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-kotoba-text mb-2">
              {tab === "published" ? "No tienes obras publicadas" : "No tienes borradores"}
            </h3>
            <p className="text-sm text-kotoba-muted mb-6">Comienza tu próxima gran historia hoy.</p>
            <Link href="/dashboard/manuscripts/new/edit">
              <Button variant="outline">Crear Obra</Button>
            </Link>
          </div>
        ) : (
          displayed.map(ms => (
            <Card key={ms.id} className="hover:border-kotoba-gold/30 transition-colors group">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-6">
                  <div className="h-24 w-16 bg-kotoba-elevated rounded border border-kotoba-border flex items-center justify-center shrink-0 overflow-hidden">
                    {ms.coverUrl ? (
                      <img src={ms.coverUrl} alt={ms.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-kotoba-muted/50" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/dashboard/manuscripts/${ms.id}/edit`}>
                        <h3 className="text-lg font-bold text-kotoba-text group-hover:text-kotoba-gold transition-colors truncate max-w-[250px] sm:max-w-none">
                          {ms.title}
                        </h3>
                      </Link>
                      <Badge variant={ms.status === "ongoing" ? "secondary" : ms.status === "completed" ? "outline" : "default"} className="text-[10px]">
                        {ms.status === "ongoing" ? "En emisión" : ms.status === "completed" ? "Completada" : ms.status === "draft" ? "Borrador" : ms.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-kotoba-muted">
                      {ms.chapterCount || 0} capítulos
                      {ms.genres?.length ? ` • ${ms.genres.join(", ")}` : ""}
                    </p>
                    <div className="flex gap-4 text-xs text-kotoba-muted/70">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {(ms.viewCount || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {ms.chapterCount || 0} caps
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-kotoba-border">
                    <Link href={`/dashboard/manuscripts/${ms.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit3 className="h-4 w-4" /> Editar
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-400/60 hover:text-red-400" onClick={() => setDeleteTarget(ms.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-kotoba-elevated border border-kotoba-border rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-kotoba-text">¿Eliminar obra?</h3>
            <p className="text-sm text-kotoba-muted">Se eliminarán todos los capítulos y comentarios asociados. No se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={() => deleteMutation.mutate(deleteTarget)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
