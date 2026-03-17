import { useState } from "react";
import { CATEGORIAS, CategoryKey } from "@/data/espacios";

interface MapLegendProps {
  activeFilter: CategoryKey | "TODOS";
  onFilterChange: (filter: CategoryKey | "TODOS") => void;
}

const MapLegend = ({ activeFilter, onFilterChange }: MapLegendProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-[1000] animate-slide-in" style={{ width: "210px" }}>
      <div
        className="rounded-xl shadow-2xl border overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="px-3 py-2.5"
          style={{ background: "linear-gradient(135deg, #0f1923 0%, #1a2d45 100%)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <i className="fas fa-map-marked-alt text-white" style={{ fontSize: "10px" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-white font-bold uppercase tracking-widest truncate"
                style={{ fontSize: "10px", letterSpacing: "0.12em" }}
              >
                Radar Cultural
              </p>
              <p className="text-white/50 uppercase tracking-wider" style={{ fontSize: "8px" }}>
                Buenos Aires · CABA
              </p>
            </div>
            {/* Botón minimizar */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
              title={collapsed ? "Expandir" : "Minimizar"}
            >
              <i
                className={`fas ${collapsed ? "fa-chevron-down" : "fa-chevron-up"} text-white`}
                style={{ fontSize: "9px" }}
              />
            </button>
          </div>
        </div>

        {/* Contenido colapsable */}
        {!collapsed && (
          <>
            {/* Filtros */}
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => onFilterChange("TODOS")}
                className="flex items-center w-full gap-2 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeFilter === "TODOS" ? "#0f1923" : "transparent",
                  color: activeFilter === "TODOS" ? "white" : "#374151",
                }}
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    fontSize: "10px",
                    background: activeFilter === "TODOS" ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                    color: activeFilter === "TODOS" ? "white" : "#6b7280",
                  }}
                >
                  <i className="fas fa-layer-group" />
                </span>
                Todos los espacios
              </button>

              {(Object.entries(CATEGORIAS) as [CategoryKey, typeof CATEGORIAS[CategoryKey]][]).map(
                ([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => onFilterChange(key)}
                    className="flex items-center w-full gap-2 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: activeFilter === key ? `${cat.color}18` : "transparent",
                      color: activeFilter === key ? cat.color : "#374151",
                      outline: activeFilter === key ? `1.5px solid ${cat.color}40` : "none",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        fontSize: "10px",
                        background: `${cat.color}22`,
                        color: cat.color,
                      }}
                    >
                      <i className={`fas ${cat.icon}`} />
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                )
              )}
            </div>

            {/* Footer Instagram */}
            <div className="px-2 pb-2 pt-0.5">
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <a
                  href="https://instagram.com/juano.monzon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  <i className="fab fa-instagram text-white text-sm" />
                  <div>
                    <p className="text-white font-bold leading-none" style={{ fontSize: "10px" }}>
                      @juano.monzon
                    </p>
                    <p className="text-white/70 leading-none mt-0.5" style={{ fontSize: "9px" }}>
                      Seguí el proyecto
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapLegend;
