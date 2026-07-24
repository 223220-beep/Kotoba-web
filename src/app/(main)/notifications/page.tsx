"use client";

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "@/lib/usePageTitle";

const mockNotifications = [
  { id: "n1", title: "Nuevo capítulo disponible", body: "El Silencio de Neón publicó el Capítulo 25.", time: "Hace 5 min", read: false },
  { id: "n2", title: "¡Nueva reseña!", body: "Un lector dejó 5 estrellas en Ecos del Vacío.", time: "Hace 1 hora", read: false },
  { id: "n3", title: "Nuevo seguidor", body: "C.M. Llorca ahora te sigue.", time: "Hace 3 horas", read: true },
  { id: "n4", title: "Tu obra está en tendencias", body: "El Silencio de Neón entró al Top 10.", time: "Hace 1 día", read: true },
];

export default function NotificationsPage() {
  usePageTitle("Notificaciones / Notifications");
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-kotoba-border pb-4">
        <Bell className="h-6 w-6 text-kotoba-gold" />
        <h1 className="font-display text-3xl font-bold text-kotoba-text">Notificaciones</h1>
      </div>

      <div className="space-y-3">
        {mockNotifications.map((n) => (
          <Card key={n.id} className={`transition-colors ${!n.read ? "border-kotoba-gold/30 bg-kotoba-gold/5" : ""}`}>
            <CardContent className="p-4 flex items-start gap-4">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-kotoba-gold" : "bg-kotoba-muted/30"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-kotoba-text">{n.title}</p>
                <p className="text-sm text-kotoba-muted mt-0.5">{n.body}</p>
                <p className="text-xs text-kotoba-muted/60 mt-2">{n.time}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
