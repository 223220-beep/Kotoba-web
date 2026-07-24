"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Send, Trash2, RefreshCw, AlignLeft, AlignCenter, AlignRight, Quote } from "lucide-react";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/lib/usePageTitle";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-96 w-full skeleton rounded-xl flex items-center justify-center text-kotoba-muted">Cargando editor...</div>
});

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{'align': []}],
    ['link'],
    ['clean']
  ],
};

export default function ChapterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = params.chapterId === "new";
  const msId = params.id as string;
  const chapterId = params.chapterId as string;
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const { data: existing } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: () => api.chapters.getById(chapterId),
    enabled: !isNew,
  });

  usePageTitle(existing?.title || "Nuevo Capítulo");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
    }
  }, [existing]);

  useEffect(() => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  }, [content]);

  // Unsaved changes protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

  const markUnsaved = useCallback(() => setHasUnsaved(true), []);

  // Autosave (debounced 10s)
  const saveMutation = useMutation({
    mutationFn: ({ status }: { status: "draft" | "published" }) => {
      const data = { work_id: msId, title, content };
      return isNew
        ? api.chapters.create({ ...data, status })
        : api.chapters.update(chapterId, { ...data, status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", msId] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      setHasUnsaved(false);
      setAutosaveStatus(variables.status === "draft" ? "saved" : "idle");
      if (isNew) {
        router.push(`/dashboard/manuscripts/${msId}/edit`);
      }
    },
  });

  useEffect(() => {
    if (!hasUnsaved || isNew) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setAutosaveStatus("saving");
      saveMutation.mutate({ status: "draft" });
    }, 10000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [title, content, hasUnsaved, isNew]);

  const handleContentChange = (val: string) => {
    setContent(val);
    markUnsaved();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    markUnsaved();
  };

  const deleteMutation = useMutation({
    mutationFn: () => api.chapters.delete(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", msId] });
      router.push(`/dashboard/manuscripts/${msId}/edit`);
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-fade-in pb-12">
      {/* Barra de herramientas superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/manuscripts/${msId}/edit`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            className="text-xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 h-auto text-kotoba-text placeholder:text-kotoba-muted/50"
            placeholder="Título del Capítulo..."
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-kotoba-muted mr-1 hidden sm:inline-block">{wordCount} palabras</span>
          {autosaveStatus === "saving" && <RefreshCw className="h-3 w-3 text-kotoba-gold animate-spin" />}
          {autosaveStatus === "saved" && <span className="text-[10px] text-green-400">Guardado</span>}
          {!isNew && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400/60 hover:text-red-400"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => saveMutation.mutate({ status: "draft" })} disabled={saveMutation.isPending || !title}>
            <Save className="h-4 w-4 mr-2" /> Borrador
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ status: "published" })} disabled={saveMutation.isPending || !title}>
            <Send className="h-4 w-4 mr-2" /> Publicar
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-kotoba-elevated border border-kotoba-border rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 quill-kotoba-theme overflow-y-auto">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            className="h-full flex flex-col"
            placeholder="Comienza a escribir tu historia..."
          />
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-kotoba-elevated border border-kotoba-border rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-kotoba-text">¿Eliminar capítulo?</h3>
            <p className="text-sm text-kotoba-muted">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .quill-kotoba-theme .ql-toolbar {
          background-color: var(--color-kotoba-surface);
          border: none !important;
          border-bottom: 1px solid var(--color-kotoba-border) !important;
          border-radius: 12px 12px 0 0;
          padding: 12px;
        }
        .quill-kotoba-theme .ql-container {
          border: none !important;
          font-family: var(--font-sans);
          font-size: 1.1rem;
          color: var(--color-kotoba-text);
          flex: 1;
        }
        .quill-kotoba-theme .ql-editor {
          padding: 2rem;
          min-height: 100%;
        }
        .quill-kotoba-theme .ql-editor.ql-blank::before {
          color: var(--color-kotoba-muted);
          font-style: italic;
        }
        .quill-kotoba-theme .ql-stroke {
          stroke: var(--color-kotoba-muted) !important;
        }
        .quill-kotoba-theme .ql-fill {
          fill: var(--color-kotoba-muted) !important;
        }
        .quill-kotoba-theme .ql-picker-label {
          color: var(--color-kotoba-muted) !important;
        }
        .quill-kotoba-theme .ql-active .ql-stroke,
        .quill-kotoba-theme .ql-picker-item:hover .ql-stroke {
          stroke: var(--color-kotoba-gold) !important;
        }
        .quill-kotoba-theme .ql-active .ql-fill,
        .quill-kotoba-theme .ql-picker-item:hover .ql-fill {
          fill: var(--color-kotoba-gold) !important;
        }
      `}} />
    </div>
  );
}
