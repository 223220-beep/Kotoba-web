"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, BookmarkPlus, Share2, Star, Clock, List, ThumbsUp, MessageCircle, Send, Pencil, Heart, Reply, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useStore";
import { usePageTitle } from "@/lib/usePageTitle";

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.id as string;
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [shareFeedback, setShareFeedback] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: work, isLoading } = useQuery({
    queryKey: ["work", workId],
    queryFn: () => api.works.getById(workId),
  });

  usePageTitle(work?.title);

  const { data: chapters } = useQuery({
    queryKey: ["chapters", workId],
    queryFn: () => api.chapters.getByWork(workId),
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", workId],
    queryFn: () => api.comments.getByWork(workId),
  });

  const { data: voteData } = useQuery({
    queryKey: ["vote", workId],
    queryFn: () => api.votes.getMyVote(workId),
    enabled: isAuthenticated,
  });

  const { data: bookmarkData } = useQuery({
    queryKey: ["bookmark", workId],
    queryFn: () => api.bookmarks.get(workId),
    enabled: isAuthenticated,
  });

  const voteMutation = useMutation({
    mutationFn: async (vote: 1 | -1) => {
      if (voteData?.userVote === vote) {
        await api.votes.removeVote(workId);
      } else {
        await api.votes.vote(workId, vote);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote", workId] });
      queryClient.invalidateQueries({ queryKey: ["work", workId] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (bookmarkData?.bookmarked) {
        await api.bookmarks.remove(workId);
      } else {
        await api.bookmarks.add(workId);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmark", workId] }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.comments.create(workId, content),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", workId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ parentId, content }: { parentId: string; content: string }) =>
      api.comments.reply(parentId, workId, content),
    onSuccess: () => {
      setReplyTo(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["comments", workId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) =>
      liked ? api.comments.unlike(commentId) : api.comments.like(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", workId] }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.comments.delete(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", workId] }),
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: work?.title || "Kotoba", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  if (isLoading || !work) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-64 skeleton rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-fade-in">
      {/* Header Obra */}
      <section className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 aspect-[2/3] bg-kotoba-elevated rounded-xl flex items-center justify-center border border-kotoba-border shadow-card overflow-hidden shrink-0">
          {work.coverUrl ? (
            <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="h-24 w-24 text-kotoba-muted/30" />
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {work.genres?.map((g) => (
                <Badge key={g} variant="gold" className="capitalize">{g}</Badge>
              ))}
              <Badge variant="outline" className={
                work.status === "ongoing" ? "text-green-400 border-green-400/50" : work.status === "completed" ? "text-blue-400 border-blue-400/50" : "text-kotoba-muted"
              }>
                {work.status === "ongoing" ? "En emisión" : work.status === "completed" ? "Completada" : work.status}
              </Badge>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-kotoba-text leading-tight">
              {work.title}
            </h1>

            <div className="flex items-center gap-2 text-lg text-kotoba-muted">
              <span>Por</span>
              <Link href={`/authors/${work.authorId}`} className="text-kotoba-gold-light hover:underline font-medium">
                {work.authorName || "Autor"}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-kotoba-border">
            <div className="space-y-1">
              <p className="text-xs text-kotoba-muted uppercase font-semibold">Valoración</p>
              <p className="flex items-center gap-1 text-kotoba-text font-medium">
                <Star className="h-4 w-4 text-kotoba-gold fill-kotoba-gold" />
                {work.rating?.toFixed(1) || "N/A"}
                <span className="text-kotoba-muted text-sm font-normal">({work.ratingCount || 0})</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-kotoba-muted uppercase font-semibold">Vistas</p>
              <p className="text-kotoba-text font-medium">{(work.viewCount || 0).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-kotoba-muted uppercase font-semibold">Capítulos</p>
              <p className="text-kotoba-text font-medium">{work.chapterCount || 0}</p>
            </div>
          </div>

          {work.synopsis && (
            <div className="space-y-4">
              <h3 className="font-semibold text-kotoba-text">Sinopsis</h3>
              <p className="text-kotoba-muted leading-relaxed">{work.synopsis}</p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            {chapters && chapters.length > 0 && (
              <Link href={`/read/${work.id}/${chapters[0].id}`}>
                <Button size="lg" className="w-40">Leer Capítulo 1</Button>
              </Link>
            )}

            {isAuthenticated && (
              <>
                <Button
                  size="lg"
                  variant={voteData?.userVote === 1 ? "default" : "outline"}
                  className={`${voteData?.userVote === 1 ? "bg-kotoba-gold text-kotoba-bg" : ""}`}
                  onClick={() => voteMutation.mutate(1)}
                  disabled={voteMutation.isPending}
                  title="Votar"
                >
                  <ThumbsUp className={`h-5 w-5 ${voteData?.userVote === 1 ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`transition-colors ${bookmarkData?.bookmarked ? "border-kotoba-gold text-kotoba-gold" : ""}`}
                  onClick={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isPending}
                  title={bookmarkData?.bookmarked ? "Quitar de biblioteca" : "Agregar a biblioteca"}
                >
                  <BookmarkPlus className={`h-5 w-5 ${bookmarkData?.bookmarked ? "fill-kotoba-gold" : ""}`} />
                </Button>
              </>
            )}

            <Button size="lg" variant="ghost" className="w-12 px-0 relative" onClick={handleShare} title="Compartir">
              <Share2 className="h-5 w-5" />
              {shareFeedback && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-kotoba-surface border border-kotoba-border text-xs text-kotoba-text rounded px-2 py-1 whitespace-nowrap shadow-card">
                  ¡Enlace copiado!
                </span>
              )}
            </Button>
          </div>

          {user?.id === work.authorId && (
            <Link href={`/dashboard/manuscripts/${work.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" /> Editar obra
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Índice de Capítulos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-kotoba-border pb-4">
          <div className="flex items-center gap-2 text-kotoba-text">
            <List className="h-5 w-5 text-kotoba-gold" />
            <h2 className="font-display text-2xl font-semibold">Índice de Capítulos</h2>
          </div>
          <span className="text-sm text-kotoba-muted">{chapters?.length || 0} capítulos</span>
        </div>

        <div className="grid gap-3">
          {chapters?.length === 0 && (
            <p className="text-kotoba-muted text-center py-8">Esta obra aún no tiene capítulos publicados.</p>
          )}
          {chapters?.map((chapter) => (
            <Link key={chapter.id} href={`/read/${work.id}/${chapter.id}`}>
              <Card className="hover:border-kotoba-gold/30 hover:bg-kotoba-surface transition-colors cursor-pointer border-transparent bg-kotoba-elevated">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-kotoba-text">
                      Cap. {chapter.orderNumber}: {chapter.title}
                    </h4>
                    <p className="text-xs text-kotoba-muted mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {chapter.publishedAt
                          ? new Date(chapter.publishedAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
                          : "Borrador"}
                      </span>
                      {chapter.wordCount && <span>{chapter.wordCount} palabras</span>}
                    </p>
                  </div>
                  {chapter.status === "draft" && <Badge variant="secondary" className="text-[10px]">Borrador</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Comentarios */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-kotoba-border pb-4">
          <MessageCircle className="h-5 w-5 text-kotoba-gold" />
          <h2 className="font-display text-2xl font-semibold text-kotoba-text">Comentarios</h2>
          <span className="text-sm text-kotoba-muted ml-2">({comments?.length || 0})</span>
        </div>

        {isAuthenticated && (
          <form
            onSubmit={(e) => { e.preventDefault(); if (commentText.trim()) commentMutation.mutate(commentText.trim()); }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-kotoba-elevated border border-kotoba-border rounded-lg px-4 py-2 text-kotoba-text focus:outline-none focus:border-kotoba-gold"
            />
            <Button type="submit" disabled={!commentText.trim() || commentMutation.isPending} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {comments?.length === 0 && (
            <p className="text-kotoba-muted text-center py-8">Sé el primero en comentar.</p>
          )}
          {comments?.map((comment) => (
            <div key={comment.id}>
              <Card className="bg-kotoba-elevated border-kotoba-border">
                <div className="p-4 flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-kotoba-surface flex items-center justify-center text-xs text-kotoba-muted shrink-0">
                    {comment.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-kotoba-text">{comment.username || "Anónimo"}</span>
                      <span className="text-xs text-kotoba-muted">
                        {new Date(comment.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-kotoba-muted mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      {isAuthenticated && (
                        <button
                          onClick={() => likeMutation.mutate({ commentId: comment.id, liked: !!comment.likedByMe })}
                          className="flex items-center gap-1 text-xs text-kotoba-muted hover:text-red-400 transition-colors"
                        >
                          <Heart className={`h-3.5 w-3.5 ${comment.likedByMe ? "fill-red-400 text-red-400" : ""}`} />
                          {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                        </button>
                      )}
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 text-xs text-kotoba-muted hover:text-kotoba-gold transition-colors"
                        >
                          <Reply className="h-3.5 w-3.5" /> Responder
                        </button>
                      )}
                      {isAuthenticated && comment.isLocal && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Reply form */}
                    {replyTo === comment.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (replyText.trim()) replyMutation.mutate({ parentId: comment.id, content: replyText.trim() });
                        }}
                        className="flex gap-2 mt-3 pt-3 border-t border-kotoba-border"
                      >
                        <input
                          type="text"
                          placeholder="Escribe una respuesta..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                          className="flex-1 bg-kotoba-bg border border-kotoba-border rounded-lg px-3 py-1.5 text-sm text-kotoba-text focus:outline-none focus:border-kotoba-gold"
                        />
                        <Button type="submit" disabled={!replyText.trim() || replyMutation.isPending} size="sm">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <Card key={reply.id} className="bg-kotoba-elevated/60 border-kotoba-border/50">
                      <div className="p-3 flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-kotoba-surface flex items-center justify-center text-[10px] text-kotoba-muted shrink-0">
                          {reply.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-kotoba-text">{reply.username || "Anónimo"}</span>
                            <span className="text-xs text-kotoba-muted">
                              {new Date(reply.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-sm text-kotoba-muted mt-1">{reply.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {isAuthenticated && (
                              <button
                                onClick={() => likeMutation.mutate({ commentId: reply.id, liked: !!reply.likedByMe })}
                                className="flex items-center gap-1 text-xs text-kotoba-muted hover:text-red-400 transition-colors"
                              >
                                <Heart className={`h-3 w-3 ${reply.likedByMe ? "fill-red-400 text-red-400" : ""}`} />
                                {reply.likeCount > 0 && <span>{reply.likeCount}</span>}
                              </button>
                            )}
                            {isAuthenticated && reply.isLocal && (
                              <button
                                onClick={() => deleteCommentMutation.mutate(reply.id)}
                                className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
