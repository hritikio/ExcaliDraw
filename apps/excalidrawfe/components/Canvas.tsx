"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";

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
    label: "Pan",
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

  // Initialise draw engine after canvas is sized
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    const cleanup = initDraw(canvasRef.current, roomId, socket);
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [canvasRef, dimensions, roomId, socket]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      {/* Canvas */}
      {dimensions.width > 0 && (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: "block", cursor: selectedTool === "pan" ? "grab" : "crosshair" }}
        />
      )}

      {/* Toolbar */}
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
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s, transform 0.1s",
              background:
                selectedTool === tool.id
                  ? "rgba(108, 99, 255, 0.9)"
                  : "transparent",
              color: selectedTool === tool.id ? "#fff" : "rgba(255,255,255,0.55)",
              transform: selectedTool === tool.id ? "scale(1.1)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (selectedTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              if (selectedTool !== tool.id)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Room ID badge */}
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

      {/* Selected tool hint */}
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
        {TOOLS.find((t) => t.id === selectedTool)?.label} tool active · drag to draw
      </div>
    </div>
  );
}
