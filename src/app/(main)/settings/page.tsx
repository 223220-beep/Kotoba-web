"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useStore";
import { api } from "@/lib/api";
import { Camera, Save, User, Bell, Shield, Paintbrush, LogOut, Globe, Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { usePageTitle } from "@/lib/usePageTitle";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  usePageTitle("Configuración / Settings");
  const { user, updateUser, logout } = useAuthStore();
  const { t, lang, setLang } = useT();
  const { mode, setTheme } = useTheme();
  const router = useRouter();
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [pronouns, setPronouns] = useState(user?.pronouns || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const updated = await api.users.updateMe({ username, fullName, pronouns, website, birthDate, bio } as any);
      updateUser(updated);
      setMessage("Perfil actualizado correctamente.");
    } catch (err: any) {
      setMessage(err.message || "Error al guardar");
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.users.uploadAvatar(file);
      updateUser({ avatarUrl: result.url });
    } catch (err: any) {
      setMessage(err.message || "Error al subir avatar");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.users.uploadBanner(file);
      updateUser({ bannerUrl: result.url });
    } catch (err: any) {
      setMessage(err.message || "Error al subir banner");
    }
  };

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <User className="h-16 w-16 text-kotoba-muted mb-4" />
        <h2 className="text-xl font-bold text-kotoba-text mb-2">No has iniciado sesión</h2>
        <p className="text-kotoba-muted mb-6">Inicia sesión para editar tu perfil.</p>
        <Button onClick={() => router.push("/login")}>Iniciar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-kotoba-text">Configuración</h1>
        <p className="text-sm text-kotoba-muted mt-1">Gestiona tu perfil público y preferencias de la cuenta.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { icon: User, label: t.settings.edit_profile, active: true },
            { icon: Globe, label: t.settings.language },
            { icon: LogOut, label: t.nav.logout, danger: true, onClick: handleLogout },
          ].map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className={`w-full justify-start ${item.active ? "bg-kotoba-surface text-kotoba-text" : ""} ${item.danger ? "text-red-400 hover:text-red-300" : ""}`}
              onClick={item.onClick}
            >
              <item.icon className="h-4 w-4 mr-3" /> {item.label}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
              {message}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>Esta información será visible para todos en Kotoba.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">

                {/* Avatar & Banner */}
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-kotoba-border pb-6">
                  <div className="relative group cursor-pointer" onClick={() => avatarInput.current?.click()}>
                    <div className="h-24 w-24 rounded-full bg-kotoba-elevated border-2 border-kotoba-border flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-display text-kotoba-gold">{user.username?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-kotoba-text" />
                    </div>
                  </div>
                  <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-sm font-medium text-kotoba-text">Foto de Perfil y Banner</p>
                    <p className="text-xs text-kotoba-muted">Recomendamos imágenes cuadradas de al menos 400x400px.</p>
                    <div className="flex justify-center sm:justify-start gap-2 pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => avatarInput.current?.click()}>Cambiar Avatar</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => bannerInput.current?.click()}>Cambiar Banner</Button>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4 pt-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">Email</label>
                    <Input value={user.email} disabled className="opacity-60" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">Nombre de usuario (@)</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="usuario_unico"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">Biografía</label>
                    <textarea
                      className="w-full min-h-[120px] p-3 rounded-md bg-kotoba-bg border border-kotoba-border text-kotoba-text placeholder:text-kotoba-muted focus:outline-none focus:ring-1 focus:ring-kotoba-gold resize-y"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntale a tus lectores un poco sobre ti..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">{t.settings.full_name}</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.settings.full_name_placeholder}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">{t.settings.pronouns}</label>
                    <Input
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder={t.settings.pronouns_placeholder}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">{t.settings.website}</label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder={t.settings.website_placeholder}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-kotoba-text">{t.settings.birth_date}</label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.language}</CardTitle>
              <CardDescription>{t.settings.language_hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button
                  onClick={() => setLang("es")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                    lang === "es"
                      ? "border-kotoba-gold bg-kotoba-gold/10 text-kotoba-gold"
                      : "border-kotoba-border bg-kotoba-elevated text-kotoba-muted hover:border-kotoba-gold/50"
                  }`}
                >
                  <span className="text-2xl block mb-1">🇪🇸</span>
                  <span className="text-sm font-medium">Español</span>
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                    lang === "en"
                      ? "border-kotoba-gold bg-kotoba-gold/10 text-kotoba-gold"
                      : "border-kotoba-border bg-kotoba-elevated text-kotoba-muted hover:border-kotoba-gold/50"
                  }`}
                >
                  <span className="text-2xl block mb-1">🇬🇧</span>
                  <span className="text-sm font-medium">English</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.theme}</CardTitle>
              <CardDescription>Personaliza la apariencia de Kotoba.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {[
                  { value: "dark", icon: Moon, label: "Oscuro" },
                  { value: "light", icon: Sun, label: "Claro" },
                  { value: "system", icon: Monitor, label: "Sistema" },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                      mode === value
                        ? "border-kotoba-gold bg-kotoba-gold/10 text-kotoba-gold"
                        : "border-kotoba-border bg-kotoba-elevated text-kotoba-muted hover:border-kotoba-gold/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Close Account */}
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">{t.settings.close_account}</CardTitle>
              <CardDescription>{t.settings.close_account_warning}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="text-red-400 border-red-400/30 hover:bg-red-400/10">
                {t.settings.close_account_confirm}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
