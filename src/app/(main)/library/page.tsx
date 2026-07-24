"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Library, Search, SlidersHorizontal, Trash2, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePageTitle } from "@/lib/usePageTitle";
import type { User, Work } from "@/lib/types";

export default function LibraryPage() {
  usePageTitle("Biblioteca / Library");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks", "mine"],
    queryFn: () => api.bookmarks.getAll(),
  });

  const { data: following } = useQuery({
    queryKey: ["following-authors"],
    queryFn: () => api.users.getFollowingAuthors(),
  });

  const removeMutation = useMutation({
    mutationFn: (workId: string) => api.bookmarks.remove(workId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks", "mine"] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => api.users.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following-authors"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="h-10 skeleton w-48 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-72 skeleton rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const bookmarkedIds = bookmarks?.map(b => b.workId) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Library className="h-8 w-8 text-kotoba-gold" />
          <h1 className="font-display text-3xl font-bold text-kotoba-text">Mi Biblioteca</h1>
          <Badge variant="outline" className="ml-2">{bookmarkedIds.length} obras</Badge>
        </div>
      </div>

      {/* Following Authors */}
      {following && following.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-kotoba-text flex items-center gap-2">
              <Users className="h-5 w-5 text-kotoba-gold" /> Autores Seguidos
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {following.map((entry) => (
              <FollowingAuthorCard
                key={entry.user.id}
                user={entry.user}
                works={entry.works}
                onUnfollow={() => unfollowMutation.mutate(entry.user.id)}
                isUnfollowing={unfollowMutation.isPending}
              />
            ))}
          </div>
        </section>
      )}

      {bookmarkedIds.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <BookOpen className="h-12 w-12 text-kotoba-muted/50 mx-auto" />
          <h3 className="text-xl font-medium text-kotoba-text">Tu biblioteca está vacía</h3>
          <p className="text-kotoba-muted">Explora obras y agrégalas a tu biblioteca para leerlas después.</p>
          <Link href="/discover">
            <Button>Descubrir obras</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bookmarkedIds.map((workId) => (
            <BookmarkCard key={workId} workId={workId} onRemove={() => removeMutation.mutate(workId)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FollowingAuthorCard({ user, works, onUnfollow, isUnfollowing }: { user: User; works: Work[]; onUnfollow: () => void; isUnfollowing: boolean }) {
  return (
    <div className="min-w-[220px] bg-kotoba-elevated border border-kotoba-border rounded-xl p-4 shrink-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-kotoba-surface flex items-center justify-center overflow-hidden shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-display text-kotoba-gold">{user.username?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${user.id}`} className="text-sm font-semibold text-kotoba-text hover:text-kotoba-gold transition-colors truncate block">
            {user.fullName || user.username}
          </Link>
          <p className="text-xs text-kotoba-muted">@{user.username}</p>
        </div>
      </div>
      {works.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-[11px] text-kotoba-muted font-medium uppercase tracking-wider">Obras recientes</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {works.slice(0, 3).map((w) => (
              <Link key={w.id} href={`/works/${w.id}`} className="shrink-0">
                <div className="h-14 w-10 bg-kotoba-surface rounded border border-kotoba-border flex items-center justify-center overflow-hidden">
                  {w.coverUrl ? (
                    <img src={w.coverUrl} alt={w.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-kotoba-muted/50" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs border-kotoba-border/50 hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5"
        onClick={onUnfollow}
        disabled={isUnfollowing}
      >
        <UserMinus className="h-3 w-3" />
        {isUnfollowing ? "..." : "Dejar de seguir"}
      </Button>
    </div>
  );
}

function BookmarkCard({ workId, onRemove }: { workId: string; onRemove: () => void }) {
  const { data: work } = useQuery({
    queryKey: ["work", workId],
    queryFn: () => api.works.getById(workId),
  });

  if (!work) {
    return <div className="h-72 skeleton rounded-xl"></div>;
  }

  return (
    <Card className="hover:shadow-gold-glow-sm transition-shadow flex flex-col group">
      <div className="aspect-[2/3] bg-kotoba-elevated rounded-t-xl flex items-center justify-center border-b border-kotoba-border relative overflow-hidden">
        {work.coverUrl ? (
          <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover rounded-t-xl" />
        ) : (
          <BookOpen className="h-12 w-12 text-kotoba-muted/50" />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {work.chapterCount && work.chapterCount > 0 && (
            <Link href={`/read/${work.id}/first`}>
              <Button size="sm" className="bg-kotoba-gold text-kotoba-bg hover:bg-kotoba-gold-light">Leer</Button>
            </Link>
          )}
          <Link href={`/works/${work.id}`}>
            <Button size="sm" variant="outline" className="border-kotoba-border text-kotoba-text hover:bg-kotoba-surface">Info</Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader className="flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-[10px]">{work.genres?.[0] || ""}</Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2 text-kotoba-text group-hover:text-kotoba-gold-light transition-colors">
          {work.title}
        </CardTitle>
        <CardDescription className="text-xs">{work.authorName || "Autor"}</CardDescription>
      </CardHeader>
    </Card>
  );
}
