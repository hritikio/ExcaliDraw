"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    // Track whether onclose already handled the disconnect
    let closedByServer = false;
    // Connection timeout — if ws doesn't open within 10s, show error
    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        if (!closedByServer) {
          setError("Connection timed out. Make sure the WebSocket server is running on port 8080.");
        }
      }
    }, 10000);

    ws.onopen = () => {
      clearTimeout(timeout);
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      // Delay so onclose can fire first — if onclose handles it (e.g. 1008), don't show error
      setTimeout(() => {
        if (!closedByServer) {
          setError("Could not connect to the collaboration server. Is the WebSocket server running?");
        }
      }, 200);
    };

    ws.onclose = (e) => {
      clearTimeout(timeout);
      closedByServer = true;
      if (e.code === 1008) {
        // Unauthorized — token invalid/expired, sign out
        localStorage.removeItem("token");
        router.replace("/signin");
      }
    };

    return () => {
      clearTimeout(timeout);
      ws.close();
    };
  }, [roomId, router]);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontFamily: "system-ui",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p style={{ color: "#ff6b6b", fontSize: "14px" }}>{error}</p>
        <button
          onClick={() => router.push("/canvas")}
          style={{
            marginTop: "8px",
            padding: "8px 20px",
            background: "#6c63ff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!socket) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          fontFamily: "system-ui",
        }}
      >
        {/* Animated logo */}
        <div style={{ position: "relative" }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="4" fill="#6c63ff" />
            <path
              d="M8 22 L14 10 L20 18 L23 14 L26 18"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
              background: "rgba(108, 99, 255, 0.3)",
            }}
          />
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "0.05em" }}>
          Connecting to room…
        </p>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.6)} }`}</style>
      </div>
    );
  }

  return <Canvas roomId={roomId} socket={socket} />;
}