"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Calendar, Eye, PenTool, TrendingUp, Users, BarChart
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useStore";
import { usePageTitle } from "@/lib/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Panel / Dashboard");
  const { user } = useAuthStore();
  const authorId = user?.id;

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard", "stats", authorId],
    queryFn: () => api.dashboard.getStats(authorId!),
    enabled: !!authorId,
  });

  const { data: works, isLoading: isLoadingWorks } = useQuery({
    queryKey: ["dashboard", "works", authorId],
    queryFn: () => api.works.getAll({ authorId }),
    enabled: !!authorId,
  });

  if (isLoadingStats || isLoadingWorks || !stats) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-10 skeleton w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton rounded-xl"></div>)}
        </div>
        <div className="h-64 skeleton rounded-xl"></div>
      </div>
    );
  }

  const manuscripts = works || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-kotoba-text">Panel de Autor</h1>
          <p className="text-kotoba-muted text-sm mt-1">Resumen de tu actividad y estadísticas</p>
        </div>
        <Link href="/dashboard/manuscripts">
          <Button className="gap-2">
            <PenTool className="h-4 w-4" /> Mis Manuscritos
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-kotoba-elevated border-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-kotoba-muted">Lectores Activos</p>
              <Users className="h-4 w-4 text-kotoba-gold" />
            </div>
            <h3 className="text-2xl font-bold text-kotoba-text">{stats.activeReaders || 0}</h3>
          </CardContent>
        </Card>

        <Card className="bg-kotoba-elevated border-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-kotoba-muted">Vistas Totales</p>
              <Eye className="h-4 w-4 text-kotoba-coral" />
            </div>
            <h3 className="text-2xl font-bold text-kotoba-text">{(stats.totalReads || 0).toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="bg-kotoba-elevated border-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-kotoba-muted">Obras Publicadas</p>
              <BookOpen className="h-4 w-4 text-kotoba-gold-light" />
            </div>
            <h3 className="text-2xl font-bold text-kotoba-text">{stats.publishedWorks || manuscripts.length}</h3>
          </CardContent>
        </Card>

        <Card className="bg-kotoba-elevated border-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-kotoba-muted">Seguidores</p>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-kotoba-text">{stats.followers || 0}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Manuscritos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-kotoba-text">Mis Obras</h2>
            <Link href="/dashboard/manuscripts">
              <Button variant="link" size="sm">Ver todas</Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {manuscripts.length === 0 && (
              <p className="text-kotoba-muted text-center py-8">No tienes obras publicadas aún.</p>
            )}
            {manuscripts.slice(0, 5).map((ms) => (
              <Link key={ms.id} href={`/works/${ms.id}`}>
                <Card className="hover:border-kotoba-gold/30 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-10 bg-kotoba-elevated rounded flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-kotoba-muted" />
                      </div>
                      <div>
                        <h4 className="font-medium text-kotoba-text group-hover:text-kotoba-gold transition-colors">{ms.title}</h4>
                        <p className="text-xs text-kotoba-muted mt-1">
                          {ms.chapterCount || 0} caps • {ms.genres?.join(", ") || ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ms.status === "ongoing" ? "secondary" : ms.status === "completed" ? "outline" : "default"} className="hidden sm:inline-flex">
                      {ms.status === "ongoing" ? "En emisión" : ms.status === "completed" ? "Completada" : ms.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-kotoba-surface to-kotoba-elevated border-kotoba-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-kotoba-gold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-kotoba-muted">Próxima publicación</span>
                  <span className="text-kotoba-text">{stats.nextPublicationDeadline ? new Date(stats.nextPublicationDeadline).toLocaleDateString() : "Sin programar"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Interacción (30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={stats.engagementData || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import type { EngagementPoint } from "@/lib/types";

function LineChart({ data }: { data: EngagementPoint[] }) {
  if (!data.length) return <p className="text-kotoba-muted text-sm text-center py-8">Sin datos de interacción</p>;

  const width = 280;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
    date: d.date,
    value: d.value,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a46c" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c8a46c" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={linePath} fill="none" stroke="#c8a46c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i} className="group">
          <circle cx={p.x} cy={p.y} r="3" fill="#c8a46c" />
          <circle cx={p.x} cy={p.y} r="6" fill="transparent" className="cursor-pointer" />
          <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <rect x={p.x - 24} y={p.y - 22} width="48" height="16" rx="3" fill="#1a1a2e" stroke="#c8a46c" strokeWidth="0.5" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#e2d5c0" fontSize="9" fontFamily="monospace">
              {p.value}
            </text>
          </g>
        </g>
      ))}
      {points.filter((_, i) => i % Math.max(Math.floor(data.length / 5), 1) === 0).map((p, i) => (
        <text key={i} x={p.x} y={height - 4} textAnchor="middle" fill="#8b7e6a" fontSize="8">
          {new Date(p.date + "T00:00:00").getDate()}
        </text>
      ))}
    </svg>
  );
}
