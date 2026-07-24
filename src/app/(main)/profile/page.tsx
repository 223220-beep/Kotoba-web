"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card as WorkCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { User, Settings, BookMarked, BookOpen, Users, Eye, Calendar, PenLine, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";

export default function MyProfilePage() {
  usePageTitle("Mi Perfil / My Profile");
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data: profile } = useQuery({
    queryKey: ["author", user?.id],
    queryFn: () => api.users.getProfile(user!.id),
    enabled: !!user,
  });

  const { data: userWorks } = useQuery({
    queryKey: ["works", "mine", user?.id],
    queryFn: () => api.works.getAll({ authorId: user!.id }),
    enabled: !!user,
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => api.dashboard.getStats(user!.id),
    enabled: !!user,
  });

  if (!user) return null;

  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;
  const totalReads = dashboard?.totalReads ?? profile?.totalReads ?? 0;
  const publishedWorksCount = dashboard?.publishedWorks ?? profile?.publishedWorks ?? userWorks?.length ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Banner & Header */}
      <div className="relative">
        <div className="h-48 w-full bg-kotoba-hero rounded-xl border border-kotoba-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gold-shimmer opacity-20"></div>
          {user.bannerUrl && <img src={user.bannerUrl} alt="" loading="lazy" className="w-full h-full object-cover" />}
        </div>

        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="h-32 w-32 rounded-full border-4 border-kotoba-bg bg-kotoba-elevated overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl text-kotoba-gold">{user.username?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div className="mb-2 space-y-1 bg-kotoba-bg/80 backdrop-blur-sm p-2 rounded-lg">
            <h1 className="font-display text-3xl font-bold text-kotoba-text">{user.username}</h1>
            <p className="text-sm text-kotoba-muted">@{user.username}</p>
          </div>
        </div>

        <div className="absolute bottom-4 right-8 flex gap-3">
          <Link href="/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" /> Editar Perfil
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 border-kotoba-gold/30 text-kotoba-gold hover:bg-kotoba-gold/10">
            <span className="text-lg leading-none">♥</span> Apoyar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acerca de mí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-kotoba-text/90 leading-relaxed">
                {user.bio || "Aún no has escrito una biografía. ¡Ve a configuración para añadir una!"}
              </p>
              {user.country && (
                <p className="text-xs text-kotoba-muted flex items-center gap-1">
                  📍 {user.country}
                </p>
              )}
              {user.createdAt && (
                <p className="text-xs text-kotoba-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Miembro desde {new Date(user.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Genres I write */}
          {userWorks && userWorks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase text-kotoba-muted font-semibold tracking-wide">Géneros que escribo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const genreCount = new Map<string, number>();
                    userWorks.forEach(w => w.genres?.forEach(g => genreCount.set(g, (genreCount.get(g) || 0) + 1)));
                    return [...genreCount.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([g, count]) => (
                        <Badge key={g} variant="outline" className="text-xs border-kotoba-gold/20">
                          {g} <span className="text-kotoba-muted ml-1">({count})</span>
                        </Badge>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-kotoba-border border-b border-kotoba-border">
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{followersCount}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Seguidores</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{followingCount}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Siguiendo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-kotoba-border">
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{publishedWorksCount}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Obras</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-kotoba-text">{totalReads > 0 ? `${(totalReads / 1000).toFixed(1)}k` : "0"}</p>
                  <p className="text-xs text-kotoba-muted uppercase">Lecturas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Stats (if author) */}
          {dashboard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase text-kotoba-muted font-semibold tracking-wide">Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-kotoba-muted flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Lectores activos</span>
                  <span className="font-semibold text-kotoba-text">{dashboard.activeReaders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-kotoba-muted flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Seguidores</span>
                  <span className="font-semibold text-kotoba-text">{dashboard.followers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-kotoba-muted flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> Obras publicadas</span>
                  <span className="font-semibold text-kotoba-text">{dashboard.publishedWorks}</span>
                </div>
                {dashboard.nextPublicationDeadline && (
                  <div className="pt-2 border-t border-kotoba-border">
                    <p className="text-xs text-kotoba-muted">Próxima publicación: {new Date(dashboard.nextPublicationDeadline).toLocaleDateString("es-ES")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mis Obras */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-kotoba-gold" />
                <h2 className="font-display text-2xl font-bold text-kotoba-text">Mis Obras</h2>
                <span className="text-sm text-kotoba-muted">({userWorks?.length || 0})</span>
              </div>
              <Link href="/dashboard/manuscripts">
                <Button variant="outline" size="sm">Gestionar</Button>
              </Link>
            </div>

            {!userWorks || userWorks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-kotoba-muted/30 mb-4" />
                  <h3 className="text-lg font-medium text-kotoba-text mb-2">Aún no has publicado obras</h3>
                  <p className="text-sm text-kotoba-muted max-w-sm mb-6">
                    Comienza a escribir y comparte tus historias con la comunidad.
                  </p>
                  <Link href="/dashboard/manuscripts">
                    <Button>Crear obra</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userWorks.map((work) => (
                  <WorkCard key={work.id} className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group">
                    <div className="flex p-4 gap-4">
                      <div className="w-20 h-28 bg-kotoba-elevated rounded-md flex-shrink-0 flex items-center justify-center border border-kotoba-border overflow-hidden">
                        {work.coverUrl ? (
                          <img src={work.coverUrl} alt={work.title} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-kotoba-muted/30" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link href={`/works/${work.id}`}>
                              <h3 className="font-bold text-lg text-kotoba-text group-hover:text-kotoba-gold transition-colors truncate">{work.title}</h3>
                            </Link>
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              {work.status === "ongoing" ? "Emisión" : work.status === "completed" ? "Completada" : work.status}
                            </Badge>
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
                  </WorkCard>
                ))}
              </div>
            )}
          </section>

          {/* Seguidores recientes / Siguiendo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-kotoba-gold" />
              <h2 className="font-display text-2xl font-bold text-kotoba-text">Siguiendo</h2>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-kotoba-muted/30 mb-4" />
                <h3 className="text-lg font-medium text-kotoba-text mb-2">Autores que sigues</h3>
                <p className="text-sm text-kotoba-muted max-w-sm">
                  Sigue a tus autores favoritos para ver sus nuevas publicaciones.
                </p>
                <Link href="/discover" className="mt-6">
                  <Button variant="outline">Descubrir autores</Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Actividad reciente (placeholder con datos reales) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-kotoba-gold" />
              <h2 className="font-display text-2xl font-bold text-kotoba-text">Actividad Reciente</h2>
            </div>

            <Card>
              <CardContent className="p-0 divide-y divide-kotoba-border">
                {userWorks && userWorks.length > 0 ? (
                  userWorks.slice(0, 5).map((work) => (
                    <div key={work.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-2 w-2 rounded-full bg-kotoba-gold shrink-0" />
                        <p className="text-sm text-kotoba-text truncate">
                          {work.title}
                        </p>
                      </div>
                      <p className="text-xs text-kotoba-muted shrink-0 ml-4">
                        {new Date(work.updatedAt || work.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-kotoba-muted/30 mb-4" />
                    <p className="text-sm text-kotoba-muted">No hay actividad reciente.</p>
                    <Link href="/discover" className="mt-4">
                      <Button variant="outline" size="sm">Ir a Descubrir</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
