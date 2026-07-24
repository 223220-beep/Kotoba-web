"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { VALID_GENRES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { WorkStatus } from "@/lib/types";
import { ArrowLeft, Plus, Image as ImageIcon, BookOpen, Save, ChevronUp, ChevronDown, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";

export default function StoryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = params.id === "new";
  const msId = params.id as string;
  const coverInput = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const { data: work } = useQuery({
    queryKey: ["work", msId],
    queryFn: () => api.works.getById(msId),
    enabled: !isNew,
  });

  usePageTitle(work?.title || "Crear Nueva Obra");

  const { data: chapters } = useQuery({
    queryKey: ["chapters", msId],
    queryFn: () => api.chapters.getByWork(msId),
    enabled: !isNew,
  });

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState<WorkStatus>("draft");
  const [matureContent, setMatureContent] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (work) {
      setTitle(work.title);
      setSynopsis(work.synopsis || "");
      setGenres(work.genres || []);
      setTags(work.tags || []);
      setCoverUrl(work.coverUrl || "");
      setStatus(work.status || "draft");
      setMatureContent((work as any).matureContent || false);
      setCompleted(work.status === "completed");
    }
  }, [work]);

  useEffect(() => {
    if (completed && status !== "completed") setStatus("completed");
    else if (!completed && status === "completed") setStatus("ongoing");
  }, [completed]);

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput("");
    }
    tagInputRef.current?.focus();
  };

  const removeTag = (t: string) => {
    setTags(prev => prev.filter(x => x !== t));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const data: any = { title, synopsis, genres, tags, status, cover_url: coverUrl, mature_content: matureContent };
      return isNew ? api.works.create(data) : api.works.update(msId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work"] });
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["manuscripts"] });
      if (isNew) router.push("/dashboard/manuscripts");
    },
  });

  const coverMutation = useMutation({
    mutationFn: (file: File) => api.upload.cover(file),
    onSuccess: (data) => setCoverUrl(data.url),
  });

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) coverMutation.mutate(file);
  };

  const deleteChapterMutation = useMutation({
    mutationFn: (chId: string) => api.chapters.delete(chId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", msId] });
      setDeleteTarget(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ chId, newOrder }: { chId: string; newOrder: number }) => {
      await api.chapters.update(chId, { orderNumber: newOrder } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chapters", msId] }),
  });

  const moveUp = (idx: number) => {
    if (!chapters || idx === 0) return;
    const a = chapters[idx];
    const b = chapters[idx - 1];
    reorderMutation.mutate({ chId: a.id, newOrder: idx });
    reorderMutation.mutate({ chId: b.id, newOrder: idx + 1 });
  };

  const moveDown = (idx: number) => {
    if (!chapters || idx >= chapters.length - 1) return;
    const a = chapters[idx];
    const b = chapters[idx + 1];
    reorderMutation.mutate({ chId: a.id, newOrder: idx + 2 });
    reorderMutation.mutate({ chId: b.id, newOrder: idx + 1 });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-kotoba-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/manuscripts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-kotoba-text">
            {isNew ? "Crear Nueva Obra" : "Configuración de Obra"}
          </h1>
          {!isNew && <p className="text-sm text-kotoba-muted mt-1">{work?.title}</p>}
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title} className="gap-2">
          <Save className="h-4 w-4" /> {saveMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles Generales</CardTitle>
              <CardDescription>La información pública de tu historia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-kotoba-text">Título</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="El título de tu gran historia..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kotoba-text">Sinopsis</label>
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md bg-kotoba-bg border border-kotoba-border text-kotoba-text placeholder:text-kotoba-muted focus:outline-none focus:ring-1 focus:ring-kotoba-gold resize-y"
                    placeholder="Atrapa a tus lectores con un buen resumen..."
                    value={synopsis}
                    onChange={e => setSynopsis(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kotoba-text">Géneros</label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_GENRES.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          genres.includes(g)
                            ? "bg-kotoba-gold text-kotoba-bg border-kotoba-gold"
                            : "bg-kotoba-elevated text-kotoba-muted border-kotoba-border hover:border-kotoba-gold/50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kotoba-text">Tags</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {tags.map(t => (
                      <Badge key={t} variant="secondary" className="gap-1 text-xs">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Añadir tag..."
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kotoba-text">Estado</label>
                  <div className="flex flex-col gap-3">
                    <select
                      className="w-full h-10 px-3 rounded-md bg-kotoba-bg border border-kotoba-border text-kotoba-text focus:outline-none focus:ring-1 focus:ring-kotoba-gold"
                      value={status}
                      onChange={e => setStatus(e.target.value as WorkStatus)}
                      disabled={completed}
                    >
                      <option value="draft">Borrador</option>
                      <option value="ongoing">En Emisión</option>
                      <option value="completed">Completada</option>
                      <option value="hiatus">En Pausa</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={matureContent} onChange={e => setMatureContent(e.target.checked)} />
                        <div className="w-9 h-5 bg-kotoba-elevated rounded-full peer peer-checked:bg-kotoba-gold/60 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                      <span className="text-sm text-kotoba-muted">Contenido Adulto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={completed} onChange={e => setCompleted(e.target.checked)} />
                        <div className="w-9 h-5 bg-kotoba-elevated rounded-full peer peer-checked:bg-green-500/60 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                      <span className="text-sm text-kotoba-muted">Historia Finalizada</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter List */}
          {!isNew && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Índice de Capítulos</CardTitle>
                  <CardDescription>Gestiona el contenido de tu historia</CardDescription>
                </div>
                <Link href={`/dashboard/manuscripts/${msId}/chapters/new/edit`}>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nuevo Capítulo</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 pt-4">
                  {!chapters || chapters.length === 0 ? (
                    <div className="text-center py-8 text-kotoba-muted text-sm">
                      Aún no tienes capítulos.
                    </div>
                  ) : (
                    chapters.map((ch, idx) => (
                      <div key={ch.id} className="flex items-center justify-between p-3 border border-kotoba-border rounded-lg bg-kotoba-elevated hover:border-kotoba-gold/30 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-kotoba-muted/40 hover:text-kotoba-gold disabled:opacity-20">
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button onClick={() => moveDown(idx)} disabled={idx === chapters.length - 1} className="text-kotoba-muted/40 hover:text-kotoba-gold disabled:opacity-20">
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-xs text-kotoba-muted w-6 text-right font-mono">{idx + 1}</span>
                          <div className="min-w-0">
                            <Link href={`/dashboard/manuscripts/${msId}/chapters/${ch.id}/edit`}>
                              <p className="font-medium text-kotoba-text group-hover:text-kotoba-gold transition-colors truncate">{ch.title}</p>
                            </Link>
                            <p className="text-xs text-kotoba-muted flex items-center gap-2 mt-1">
                              {ch.wordCount && <span>{ch.wordCount} palabras</span>}
                              {ch.status === "draft" && <Badge variant="secondary" className="text-[10px]">Borrador</Badge>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ch.status === "published" && <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">Publicado</Badge>}
                          <button onClick={() => setDeleteTarget(ch.id)} className="text-red-400/40 hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portada</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="aspect-[2/3] w-full bg-kotoba-bg rounded-lg border-2 border-dashed border-kotoba-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-kotoba-gold/50 hover:bg-kotoba-elevated transition-all overflow-hidden relative"
                onClick={() => coverInput.current?.click()}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-kotoba-muted" />
                    <span className="text-xs text-kotoba-muted">Subir portada (JPG, PNG)</span>
                  </>
                )}
              </div>
              <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete chapter confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-kotoba-elevated border border-kotoba-border rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-kotoba-text">¿Eliminar capítulo?</h3>
            <p className="text-sm text-kotoba-muted">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={() => deleteChapterMutation.mutate(deleteTarget)} disabled={deleteChapterMutation.isPending}>
                {deleteChapterMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
