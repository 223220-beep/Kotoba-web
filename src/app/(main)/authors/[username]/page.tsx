"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Users, BookMarked, Trophy, Activity, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/stores/useStore";
import { usePageTitle } from "@/lib/usePageTitle";

export default function AuthorProfilePage() {
  const params = useParams();
  usePageTitle(params.username as string);
  const userId = params.username as string;
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["author", userId],
    queryFn: () => api.users.getProfile(userId),
  });

  const followMutation = useMutation({
    mutationFn: () =>
      profile?.isFollowedByMe ? api.users.unfollow(userId) : api.users.follow(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["author", userId] }),
  });

  if (isLoading || !profile) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-48 skeleton rounded-xl"></div>
        <div className="flex gap-8">
          <div className="w-1/3 h-64 skeleton rounded-xl"></div>
          <div className="w-2/3 space-y-4">
            <div className="h-8 skeleton w-1/2 rounded"></div>
            <div className="h-24 skeleton rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Banner & Header */}
      <div className="relative">
        <div className="h-48 w-full bg-kotoba-hero rounded-xl border border-kotoba-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gold-shimmer opacity-20"></div>
          {profile.bannerUrl && <img src={profile.bannerUrl} alt="Banner" loading="lazy" className="w-full h-full object-cover" />}
        </div>

        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="h-32 w-32 rounded-full border-4 border-kotoba-bg bg-kotoba-elevated overflow-hidden flex items-center justify-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl text-kotoba-gold">{profile.username?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div className="mb-2 space-y-1 bg-kotoba-bg/80 backdrop-blur-sm p-2 rounded-lg">
            <h1 className="font-display text-3xl font-bold text-kotoba-text">{profile.username}</h1>
            <p className="text-sm text-kotoba-muted">@{profile.username}</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-8 flex gap-3">
          {user && user.id !== userId && (
            <Button onClick={() => followMutation.mutate()} disabled={followMutation.isPending}>
              {profile.isFollowedByMe ? "Siguiendo" : "Seguir"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16">

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acerca de</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-kotoba-text/90 leading-relaxed">
                {profile.bio || "Este autor aún no ha escrito una biografía."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-kotoba-border border-b border-kotoba-border">
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{profile.followersCount || 0}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Seguidores</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{profile.followingCount || 0}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Siguiendo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-kotoba-border">
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{profile.publishedWorks || profile.works?.length || 0}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Obras</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{profile.totalReads ? `${(profile.totalReads / 1000).toFixed(1)}k` : "0"}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Lecturas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content (Works) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookMarked className="h-5 w-5 text-kotoba-gold" />
              <h2 className="font-display text-2xl font-bold text-kotoba-text">Obras Publicadas</h2>
            </div>

            <div className="grid gap-4">
              {profile.works?.length === 0 && (
                <p className="text-kotoba-muted text-center py-8">Este autor aún no ha publicado obras.</p>
              )}
              {profile.works?.map((work) => (
                <Card key={work.id} className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group">
                  <div className="flex p-4 gap-4">
                    <div className="w-20 h-28 bg-kotoba-elevated rounded-md flex-shrink-0 flex items-center justify-center border border-kotoba-border overflow-hidden">
                      {work.coverUrl ? (
                        <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-8 w-8 text-kotoba-muted/30" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/works/${work.id}`}>
                            <h3 className="font-bold text-lg text-kotoba-text group-hover:text-kotoba-gold transition-colors">{work.title}</h3>
                          </Link>
                          <Badge variant="secondary" className="text-[10px]">{work.status === "ongoing" ? "Emisión" : work.status === "completed" ? "Completada" : work.status}</Badge>
                        </div>
                        <p className="text-sm text-kotoba-muted line-clamp-2 mt-1">{work.synopsis}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-kotoba-muted mt-2">
                        <span>⭐ {work.rating?.toFixed(1) || "N/A"}</span>
                        <span>👁️ {(work.viewCount || 0).toLocaleString()}</span>
                        <span>📑 {work.chapterCount || 0} caps</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
