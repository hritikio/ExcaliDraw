"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HTTP_BACKEND } from "@/config";

export default function CanvasDashboard() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/signin");
    }
  }, [router]);

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.msg || data.message || "Failed to create room.");
        return;
      }
      setCreatedRoomId(data.roomId);
    } catch {
      setCreateError("Can't reach the server.");
    } finally {
      setCreating(false);
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const id = joinId.trim();
    if (!id) {
      setJoinError("Please enter a room ID.");
      return;
    }
    router.push(`/canvas/${id}`);
  }

  function copyRoomId() {
    if (createdRoomId !== null) {
      navigator.clipboard.writeText(String(createdRoomId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    router.push("/signin");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d14",
        fontFamily: "system-ui, sans-serif",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(108,99,255,0.15) 0%, transparent 60%)",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="4" fill="#6c63ff" stroke="#1a1a2e" strokeWidth="2" />
            <path d="M8 22 L14 10 L20 18 L23 14 L26 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="8" cy="22" r="1.5" fill="white" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#fff", letterSpacing: "-0.01em" }}>sketchpad</span>
        </Link>

        <button
          onClick={handleSignOut}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "7px 16px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
          }}
        >
          Sign out
        </button>
      </nav>

      {/* Hero text */}
      <div style={{ textAlign: "center", padding: "56px 24px 40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)",
            borderRadius: "999px",
            padding: "5px 14px",
            marginBottom: "20px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6c63ff", display: "inline-block" }} />
          <span style={{ color: "#a29bfe", fontSize: "12px", fontWeight: 600 }}>Your canvas dashboard</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 12px",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Start or join a room
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px", margin: 0 }}>
          Create a collaborative canvas or jump into an existing one.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          maxWidth: "780px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {/* Create Room Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "rgba(108,99,255,0.15)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Create a room</h2>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>Get a unique room ID to share</p>
            </div>
          </div>

          {createdRoomId !== null ? (
            <div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "10px" }}>
                Room created! Share this ID with collaborators:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(108,99,255,0.1)",
                  border: "1px solid rgba(108,99,255,0.3)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "14px",
                }}
              >
                <span style={{ color: "#a29bfe", fontWeight: 700, fontSize: "22px", fontFamily: "monospace", flex: 1 }}>
                  {createdRoomId}
                </span>
                <button
                  onClick={copyRoomId}
                  title="Copy"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: copied ? "#6c63ff" : "rgba(255,255,255,0.3)",
                    padding: "4px",
                    display: "flex",
                    transition: "color 0.2s",
                  }}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={() => router.push(`/canvas/${createdRoomId}`)}
                style={{
                  width: "100%",
                  background: "#6c63ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Open canvas
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateRoom} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                id="room-name-input"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. my-project-board"
                required
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(108,99,255,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
              />
              {createError && (
                <p style={{ color: "#ff6b6b", fontSize: "12px", margin: 0 }}>{createError}</p>
              )}
              <button
                id="create-room-btn"
                type="submit"
                disabled={creating}
                style={{
                  background: creating ? "rgba(108,99,255,0.5)" : "#6c63ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: creating ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {creating ? "Creating…" : "Create room →"}
              </button>
            </form>
          )}
        </div>

        {/* Join Room Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "rgba(162,155,254,0.12)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div>
              <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Join a room</h2>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>Enter an existing room ID</p>
            </div>
          </div>

          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              id="join-room-input"
              type="text"
              value={joinId}
              onChange={(e) => {
                setJoinId(e.target.value);
                setJoinError(null);
              }}
              placeholder="Paste room ID here"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(162,155,254,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            />
            {joinError && (
              <p style={{ color: "#ff6b6b", fontSize: "12px", margin: 0 }}>{joinError}</p>
            )}
            <button
              id="join-room-btn"
              type="submit"
              style={{
                background: "rgba(162,155,254,0.15)",
                color: "#a29bfe",
                border: "1px solid rgba(162,155,254,0.3)",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(162,155,254,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(162,155,254,0.15)";
              }}
            >
              Join room →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
