import { useState } from "react";
import { espacios } from "@/data/espacios";
import type { Espacio } from "@/data/espacios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PinesEditor = () => {
  const { toast } = useToast();
  const [pines, setPines] = useState<Espacio[]>(espacios.map((e) => ({ ...e })));
  const [modificados, setModificados] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const pinesFiltrados = pines.filter((p) =>
    p.n.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirEnMaps = (nombre: string) => {
    const query = encodeURIComponent(nombre + " Buenos Aires");
    window.open(`https://www.google.com/maps/search/${query}`, "_blank");
    setSeleccionado(nombre);
  };

  const handlePegar = (nombre: string, valor: string) => {
    setInputs((prev) => ({ ...prev, [nombre]: valor }));
    // Intentar parsear "lat, lng"
    const match = valor.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      setPines((prev) =>
        prev.map((p) =>
          p.n === nombre ? { ...p, c: [lat, lng] as [number, number] } : p
        )
      );
      setModificados((prev) => new Set(prev).add(nombre));
    }
  };

  const copiarCodigo = () => {
    const lineas = pines
      .map((p) => `  { n: "${p.n}", c: [${p.c[0].toFixed(4)}, ${p.c[1].toFixed(4)}], cat: "${p.cat}" },`)
      .join("\n");
    navigator.clipboard.writeText(lineas);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    toast({ title: "✅ Coordenadas copiadas — pegá en espacios.ts" });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", margin: "0 0 4px" }}>📍 Editor de coordenadas</p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              Hacé click en 🗺️ → click derecho en el punto exacto en Google Maps → copiá las coordenadas → pegálas en el campo.
            </p>
          </div>
          <Button onClick={copiarCodigo} size="sm" disabled={modificados.size === 0}>
            {copiado ? "✅ Copiado!" : `📋 Copiar todo${modificados.size > 0 ? ` (${modificados.size} cambios)` : ""}`}
          </Button>
        </div>
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar lugar..."
        />
      </div>

      {/* Tip */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", marginBottom: "12px", fontSize: "12px", color: "#1e40af" }}>
        💡 En Google Maps: click derecho sobre la ubicación → el primer ítem muestra las coordenadas → hacé click para copiarlas → pegá todo junto en el campo, se separan automáticamente.
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {pinesFiltrados.map((p) => (
          <div
            key={p.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${seleccionado === p.n ? "#bfdbfe" : modificados.has(p.n) ? "#bbf7d0" : "#e5e7eb"}`,
              background: seleccionado === p.n ? "#eff6ff" : modificados.has(p.n) ? "#f0fdf4" : "white",
              flexWrap: "wrap",
            }}
          >
            {/* Nombre + botón Maps */}
            <div style={{ flex: 1, minWidth: "160px", display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => abrirEnMaps(p.n)}
                title="Abrir en Google Maps"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "4px 8px", fontSize: "14px", cursor: "pointer", flexShrink: 0 }}
              >
                🗺️
              </button>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 1px" }}>{p.n}</p>
                <span style={{ fontSize: "10px", color: modificados.has(p.n) ? "#16a34a" : "#9ca3af", fontFamily: "monospace" }}>
                  {p.c[0].toFixed(4)}, {p.c[1].toFixed(4)}
                  {modificados.has(p.n) && " ✓"}
                </span>
              </div>
            </div>

            {/* Input único */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "240px" }}>
              <label style={{ fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pegar coordenadas de Google Maps
              </label>
              <input
                type="text"
                value={inputs[p.n] || ""}
                onChange={(e) => handlePegar(p.n, e.target.value)}
                placeholder="-34.5838, -58.3923"
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: `1px solid ${modificados.has(p.n) ? "#86efac" : "#d1d5db"}`,
                  fontFamily: "monospace",
                  background: modificados.has(p.n) ? "#f0fdf4" : "white",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinesEditor;