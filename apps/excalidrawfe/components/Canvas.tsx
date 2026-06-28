"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState, useCallback } from "react";

type Tool = "rect" | "circle" | "pencil" | "pan";

const TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  {
    id: "rect",
    label: "Rectangle",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    id: "circle",
    label: "Circle",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: "pencil",
    label: "Pencil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
  },
  {
    id: "pan",
    label: "Pan (drag canvas)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
        <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
        <path d="M10 10.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2V14a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-2a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      </svg>
    ),
  },
];

export function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Set canvas dimensions client-side only
  useEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Keep window.selectedTool in sync for the draw engine
  useEffect(() => {
    // @ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  // Receive viewport changes from draw engine and update scale badge
  useEffect(() => {
    // @ts-ignore
    window.__onVpChange = (vp: { scale: number }) => {
      setScale(vp.scale);
    };
    return () => {
      // @ts-ignore
      window.__onVpChange = undefined;
    };
  }, []);

  // Initialise draw engine after canvas is sized
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    const cleanup = initDraw(canvasRef.current, roomId, socket);
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [canvasRef, dimensions, roomId, socket]);

  // ── Zoom button helpers ────────────────────────────────────────────────────
  const zoomBy = useCallback((factor: number) => {
    // @ts-ignore
    const vp = window.__vp;
    // @ts-ignore
    const setVp = window.__setVp;
    if (!vp || !setVp) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newScale = Math.min(20, Math.max(0.05, vp.scale * factor));
    const ratio = newScale / vp.scale;
    setVp({
      scale: newScale,
      offsetX: cx - ratio * (cx - vp.offsetX),
      offsetY: cy - ratio * (cy - vp.offsetY),
    });
  }, []);

  const resetZoom = useCallback(() => {
    // @ts-ignore
    const setVp = window.__setVp;
    if (!setVp) return;
    setVp({ offsetX: 0, offsetY: 0, scale: 1 });
  }, []);

  const btnStyle = (active = false): React.CSSProperties => ({
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s, transform 0.1s",
    background: active ? "rgba(108, 99, 255, 0.9)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.55)",
    transform: active ? "scale(1.1)" : "scale(1)",
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0d0d12" }}>
      {/* Canvas */}
      {dimensions.width > 0 && (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: "block", cursor: selectedTool === "pan" ? "grab" : "crosshair" }}
        />
      )}

      {/* ── Left toolbar (drawing tools) ── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "20px",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          background: "rgba(22, 22, 32, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "10px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            id={`tool-${tool.id}`}
            title={tool.label}
            onClick={() => setSelectedTool(tool.id)}
            style={btnStyle(selectedTool === tool.id)}
            onMouseEnter={(e) => {
              if (selectedTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* ── Zoom controls (bottom-right) ── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          background: "rgba(22, 22, 32, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "8px 8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      >
        {/* Zoom in */}
        <button
          id="zoom-in"
          title="Zoom in"
          onClick={() => zoomBy(1.2)}
          style={btnStyle()}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        {/* Scale badge — click to reset to 100% */}
        <button
          id="zoom-reset"
          title="Reset zoom to 100%"
          onClick={resetZoom}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: 700,
            padding: "2px 4px",
            borderRadius: "4px",
            transition: "color 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#a29bfe")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)")}
        >
          {Math.round(scale * 100)}%
        </button>

        {/* Zoom out */}
        <button
          id="zoom-out"
          title="Zoom out"
          onClick={() => zoomBy(1 / 1.2)}
          style={btnStyle()}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* ── Room ID badge ── */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(22, 22, 32, 0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "999px",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 100,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontFamily: "system-ui" }}>Room</span>
        <span
          style={{
            color: "#a29bfe",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          {roomId}
        </span>
        <button
          title="Copy room ID"
          onClick={() => navigator.clipboard.writeText(roomId)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>
      </div>

      {/* ── Active tool hint ── */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(22, 22, 32, 0.75)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "999px",
          padding: "5px 14px",
          color: "rgba(255,255,255,0.4)",
          fontSize: "11px",
          fontFamily: "system-ui",
          letterSpacing: "0.04em",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        {TOOLS.find((t) => t.id === selectedTool)?.label} · scroll to zoom · middle-drag to pan
      </div>
    </div>
  );
}
