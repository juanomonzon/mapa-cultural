import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MapPopupProps {
  nombre: string;
  color: string;
  hasEvent: boolean;
  onOpenGallery: () => void;
  onOpenEventos: () => void;
}

interface EventoPreview {
  titulo: string;
  descripcion: string | null;
  fecha_evento: string | null;
  instagram_url: string | null;
}

const MapPopup = ({ nombre, color, hasEvent, onOpenGallery, onOpenEventos }: MapPopupProps) => {
  const query = encodeURIComponent(nombre + " Buenos Aires");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const [preview, setPreview] = useState<EventoPreview | null>(null);

  useEffect(() => {
    if (!hasEvent) return;
    const fetchPreview = async () => {
      const { data } = await supabase
        .from("eventos")
        .select("titulo, descripcion, fecha_evento, instagram_url")
        .eq("lugar", nombre)
        .eq("estado", "aprobado")
        .order("fecha_evento", { ascending: true })
        .limit(1);
      if (data && data.length > 0) setPreview(data[0] as EventoPreview);
    };
    fetchPreview();
  }, [nombre, hasEvent]);

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        minWidth: "210px",
        padding: 0,
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >
      {/* Color accent header */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        }}
      />

      <div style={{ padding: "14px 14px 12px" }}>
        {/* Place name */}
        <p
          style={{
            color: color,
            fontWeight: 700,
            fontSize: "13px",
            lineHeight: 1.3,
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          {nombre}
        </p>

        {/* Event preview */}
        {preview && (
          <div
            style={{
              marginBottom: "10px",
              padding: "8px 10px",
              borderRadius: "8px",
              background: `${color}0d`,
              border: `1px solid ${color}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
              <span style={{ fontSize: "11px" }}>🔥</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#1f2937",
                    lineHeight: 1.3,
                    marginBottom: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {preview.titulo}
                </p>
                {preview.descripcion && (
                  <p
                    style={{
                      fontSize: "9px",
                      color: "#6b7280",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {preview.descripcion}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  {preview.fecha_evento && (
                    <span style={{ fontSize: "9px", color: "#9ca3af" }}>
                      📅 {preview.fecha_evento}
                    </span>
                  )}
                  {preview.instagram_url && (
                    <a
                      href={preview.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: color,
                        textDecoration: "none",
                      }}
                    >
                      <i className="fab fa-instagram" /> IG
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Cómo llegar */}
          <button
            onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #2A7FFF, #1a6fe0)",
              color: "white",
              transition: "opacity 0.15s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <span style={{ fontSize: "13px" }}>📍</span>
            Cómo llegar
          </button>

          {/* Ver/Subir fotos */}
          <button
            onClick={onOpenGallery}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "8px",
              border: `1.5px solid ${color}40`,
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 700,
              background: `${color}12`,
              color: color,
              transition: "all 0.15s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${color}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${color}12`;
            }}
          >
            <span style={{ fontSize: "13px" }}>📸</span>
            Ver / Subir fotos
          </button>

          {/* Eventos */}
          <button
            onClick={onOpenEventos}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1.5px solid rgba(0,0,0,0.08)",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 700,
              background: hasEvent ? "#1f2937" : "rgba(0,0,0,0.04)",
              color: hasEvent ? "white" : "#6b7280",
              transition: "opacity 0.15s",
              letterSpacing: "0.01em",
              position: "relative",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <span style={{ fontSize: "13px" }}>📅</span>
            {hasEvent ? "Ver eventos" : "Eventos"}
            {hasEvent && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "8px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "1.5px solid white",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPopup;
