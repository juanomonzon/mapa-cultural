import PinesEditor from "@/components/PinesEditor";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { espacios } from "@/data/espacios";

interface Evento {
  id: string;
  lugar: string;
  titulo: string;
  descripcion: string | null;
  fecha_evento: string | null;
  hora: string | null;
  fuente_url: string | null;
  estado: string;
  created_at: string;
}

interface FuenteEvento {
  id: string;
  lugar: string;
  url: string;
  tipo: string;
  activa: boolean;
}

interface Foto {
  id: string;
  lugar: string;
  autor: string | null;
  instagram: string | null;
  url: string;
  created_at: string;
}

type Tab = "eventos" | "fotos" | "fuentes" | "pines";

const Admin = () => {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fuentes, setFuentes] = useState<FuenteEvento[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [tab, setTab] = useState<Tab>("eventos");
  const [deletingFoto, setDeletingFoto] = useState<string | null>(null);
  const [newLugar, setNewLugar] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTipo, setNewTipo] = useState<"web" | "instagram">("web");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [evtRes, fntRes, fotRes] = await Promise.all([
      supabase.from("eventos").select("*").order("created_at", { ascending: false }),
      supabase.from("fuentes_eventos").select("*").order("lugar"),
      supabase.from("fotos").select("*").order("created_at", { ascending: false }),
    ]);
    if (evtRes.data) setEventos(evtRes.data as Evento[]);
    if (fntRes.data) setFuentes(fntRes.data as FuenteEvento[]);
    if (fotRes.data) setFotos(fotRes.data as Foto[]);
    setLoading(false);
  };

  const updateEstado = async (id: string, estado: string) => {
    await supabase.from("eventos").update({ estado }).eq("id", id);
    setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, estado } : e)));
    toast({ title: estado === "aprobado" ? "✅ Evento aprobado" : "❌ Evento rechazado" });
  };

  const deleteEvento = async (id: string) => {
    await supabase.from("eventos").delete().eq("id", id);
    setEventos((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "🗑️ Evento eliminado" });
  };

  const deleteFoto = async (foto: Foto) => {
    setDeletingFoto(foto.id);
    try {
      const url = new URL(foto.url);
      const pathMatch = url.pathname.match(/\/fotos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("fotos").remove([pathMatch[1]]);
      }
      await supabase.from("fotos").delete().eq("id", foto.id);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      toast({ title: "🗑️ Foto eliminada" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setDeletingFoto(null);
    }
  };

  const addFuente = async () => {
    if (!newLugar || !newUrl) return;
    const { error } = await supabase.from("fuentes_eventos").insert({
      lugar: newLugar,
      url: newUrl,
      tipo: newTipo,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Fuente agregada" });
      setNewLugar("");
      setNewUrl("");
      fetchAll();
    }
  };

  const runScraping = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-eventos");
      if (error) throw error;
      toast({ title: "Scraping completado", description: `${data?.events || 0} eventos encontrados` });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const lugaresUnicos = [...new Set(espacios.map((e) => e.n))].sort();
  const eventosPendientes = eventos.filter((e) => e.estado === "pendiente").length;

  const tabStyle = (t: Tab) => ({
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.15s",
    background: tab === t ? "#0f1923" : "transparent",
    color: tab === t ? "white" : "#6b7280",
    position: "relative" as const,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f1923 0%, #1a2d45 100%)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎭</div>
          <div>
            <h1 style={{ color: "white", fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Radar Cultural — Admin</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>Panel de moderación y gestión</p>
          </div>
        </div>
        <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", textDecoration: "none" }}>← Volver al mapa</a>
      </div>

      {/* Stats bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 32px", display: "flex", gap: "32px" }}>
        {[
          { label: "Eventos totales", value: eventos.length, icon: "📅" },
          { label: "Pendientes", value: eventosPendientes, icon: "⏳", highlight: eventosPendientes > 0 },
          { label: "Fotos subidas", value: fotos.length, icon: "📸" },
          { label: "Fuentes activas", value: fuentes.filter((f) => f.activa).length, icon: "🔗" },
        ].map((stat) => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{stat.icon}</span>
            <div>
              <p style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: stat.highlight ? "#ef4444" : "#0f1923", lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f3f4f6", padding: "4px", borderRadius: "10px", alignItems: "center" }}>
          <button style={tabStyle("eventos")} onClick={() => setTab("eventos")}>
            📅 Eventos
            {eventosPendientes > 0 && (
              <span style={{ position: "absolute", top: "4px", right: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "1.5px solid white" }} />
            )}
          </button>
          <button style={tabStyle("fotos")} onClick={() => setTab("fotos")}>📸 Fotos ({fotos.length})</button>
          <button style={tabStyle("fuentes")} onClick={() => setTab("fuentes")}>🔗 Fuentes ({fuentes.length})</button>
          <button style={tabStyle("pines")} onClick={() => setTab("pines")}>📍 Editar pines</button>
          <div style={{ marginLeft: "auto" }}>
            <Button onClick={runScraping} disabled={scraping} variant="secondary" size="sm">
              {scraping ? "⏳ Scrapeando..." : "🔄 Scrapear ahora"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</p>
            <p>Cargando datos...</p>
          </div>
        ) : tab === "pines" ? (
          <PinesEditor />
        ) : tab === "eventos" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {eventos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                <p style={{ fontSize: "32px" }}>📭</p>
                <p>No hay eventos. Agregá fuentes y ejecutá el scraping.</p>
              </div>
            ) : (
              eventos.map((evt) => (
                <div key={evt.id} style={{ padding: "14px 16px", borderRadius: "10px", border: `1px solid ${evt.estado === "aprobado" ? "#bbf7d0" : evt.estado === "rechazado" ? "#fecaca" : "#e5e7eb"}`, background: evt.estado === "aprobado" ? "#f0fdf4" : evt.estado === "rechazado" ? "#fff5f5" : "white", opacity: evt.estado === "rechazado" ? 0.7 : 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <p style={{ fontWeight: 700, fontSize: "13px", color: "#111827", margin: 0 }}>{evt.titulo}</p>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", fontWeight: 600, background: evt.estado === "aprobado" ? "#dcfce7" : evt.estado === "rechazado" ? "#fee2e2" : "#fef3c7", color: evt.estado === "aprobado" ? "#16a34a" : evt.estado === "rechazado" ? "#dc2626" : "#d97706" }}>{evt.estado}</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 4px" }}>📍 {evt.lugar}</p>
                      {evt.descripcion && <p style={{ fontSize: "11px", color: "#374151", margin: "0 0 6px", lineHeight: 1.4 }}>{evt.descripcion}</p>}
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {evt.fecha_evento && <span style={{ fontSize: "11px", color: "#9ca3af" }}>📅 {evt.fecha_evento}</span>}
                        {evt.hora && <span style={{ fontSize: "11px", color: "#9ca3af" }}>🕐 {evt.hora}</span>}
                        {evt.fuente_url && <a href={evt.fuente_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#2A7FFF", textDecoration: "none" }}>Ver fuente →</a>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {evt.estado === "pendiente" && (
                        <>
                          <Button size="sm" variant="default" onClick={() => updateEstado(evt.id, "aprobado")}>✅</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateEstado(evt.id, "rechazado")}>❌</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteEvento(evt.id)} style={{ color: "#9ca3af", fontSize: "14px" }}>🗑️</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === "fotos" ? (
          <div>
            {fotos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                <p style={{ fontSize: "32px" }}>📷</p>
                <p>No hay fotos subidas todavía.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {fotos.map((foto) => (
                  <div key={foto.id} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb", background: "white" }}>
                    <img src={foto.url} alt={`Foto de ${foto.autor}`} style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#111827", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {foto.lugar}</p>
                      <p style={{ fontSize: "10px", color: "#6b7280", margin: "0 0 1px" }}>Por: {foto.autor || "Anónimo"}</p>
                      {foto.instagram && <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 8px" }}>@{foto.instagram.replace("@", "")}</p>}
                      <button onClick={() => deleteFoto(foto)} disabled={deletingFoto === foto.id} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: "11px", fontWeight: 600, cursor: "pointer", opacity: deletingFoto === foto.id ? 0.6 : 1 }}>
                        {deletingFoto === foto.id ? "Eliminando..." : "🗑️ Eliminar foto"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: "#111827", marginBottom: "12px" }}>➕ Agregar fuente de eventos</p>
              <select value={newLugar} onChange={(e) => setNewLugar(e.target.value)} style={{ width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "7px", border: "1px solid #d1d5db", marginBottom: "8px", background: "white" }}>
                <option value="">Seleccionar lugar...</option>
                {lugaresUnicos.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL del sitio web o perfil de Instagram" style={{ marginBottom: "8px" }} />
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="radio" checked={newTipo === "web"} onChange={() => setNewTipo("web")} /> Web
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="radio" checked={newTipo === "instagram"} onChange={() => setNewTipo("instagram")} /> Instagram
                </label>
                <div style={{ marginLeft: "auto" }}>
                  <Button onClick={addFuente} size="sm">Agregar</Button>
                </div>
              </div>
            </div>
            {fuentes.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "20px" }}>No hay fuentes configuradas.</p>
            ) : (
              fuentes.map((f) => (
                <div key={f.id} style={{ padding: "12px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "20px", background: f.tipo === "instagram" ? "#fdf2f8" : "#eff6ff", color: f.tipo === "instagram" ? "#9d174d" : "#1e40af", fontWeight: 600 }}>{f.tipo === "instagram" ? "📸 IG" : "🌐 Web"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>{f.lugar}</p>
                    <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#2A7FFF", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.url}</a>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: f.activa ? "#16a34a" : "#9ca3af" }}>{f.activa ? "● Activa" : "○ Inactiva"}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;