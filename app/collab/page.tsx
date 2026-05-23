"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import ChatRoom from "../Components/Collab/ChatRoom";
import Sidebar from "../Components/Home/sidebar";

function subscribe() {
  return () => {};
}

export default function CollabPage() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>("");
  const [tier, setTier] = useState<string>("free");
  const [canCreate, setCanCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const activeRoomDetails = rooms.find((r) => r.id === activeRoom);

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/subscription/current");
      const data = await res.json();
      if (data.subscription?.tier) {
        setTier(data.subscription.tier);
        setCanCreate(
          data.subscription.tier === "pro" ||
            data.subscription.tier === "premium",
        );
      }
    } catch {}
  }

  async function fetchRooms() {
    try {
      const res = await fetch("/api/collab/rooms");
      const data = await res.json();
      setRooms(data.rooms ?? []);
    } catch {}
  }

  useEffect(() => {
    fetchSubscription();
    fetchRooms();
  }, []);

  async function createRoom() {
    if (!canCreate) return;
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collab/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.room) {
        setActiveRoom(data.room.id);
        setActiveRoomName(data.room.name);
        setName("");
        setShowCreate(false);
        fetchRooms();
      }
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom(id: string, roomName: string) {
    const res = await fetch(`/api/collab/rooms/${id}/join`, { method: "POST" });
    const data = await res.json();
    if (data.error) return;
    setActiveRoom(id);
    setActiveRoomName(roomName);
    fetchRooms();
  }

  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  function requestDeleteRoom(id: string, roomName: string) {
    setPendingDelete({ id, name: roomName });
  }

  async function deleteRoom(id: string) {
    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/collab/rooms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      if (activeRoom === id) {
        setActiveRoom(null);
        setActiveRoomName("");
      }
      fetchRooms();
    } finally {
      setDeleteLoading(null);
      setPendingDelete(null);
    }
  }

  function closeDeleteModal() {
    if (deleteLoading) return;
    setPendingDelete(null);
  }

  const tierColor =
    tier === "premium"
      ? "#f59e0b"
      : tier === "pro"
        ? "#818cf8"
        : "rgba(255,255,255,0.3)";
  const tierBg =
    tier === "premium"
      ? "rgba(245,158,11,0.1)"
      : tier === "pro"
        ? "rgba(129,140,248,0.1)"
        : "rgba(255,255,255,0.05)";
  const tierBorder =
    tier === "premium"
      ? "rgba(245,158,11,0.2)"
      : tier === "pro"
        ? "rgba(129,140,248,0.2)"
        : "rgba(255,255,255,0.08)";

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');
        .c-root { font-family: 'Outfit', sans-serif; }
        .c-serif { font-family: 'DM Serif Display', serif; }

        .c-input {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 11px 16px;
          width: 100%; transition: border-color 0.2s, background 0.2s;
        }
        .c-input::placeholder { color: rgba(255,255,255,0.2); }
        .c-input:focus {
          outline: none;
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.04);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.06);
        }

        .c-btn-primary {
          position: relative; overflow: hidden;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.03em;
          background: #fff; color: #0f1117;
          padding: 11px 22px; border-radius: 12px; border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          white-space: nowrap;
        }
        .c-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,255,255,0.12); }
        .c-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .c-btn-ghost {
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          background: transparent; color: rgba(255,255,255,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 9px 18px; border-radius: 10px; cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .c-btn-ghost:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.03); }

        .c-btn-join {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          background: rgba(52,211,153,0.12); color: #34d399;
          border: 1px solid rgba(52,211,153,0.2);
          padding: 7px 14px; border-radius: 9px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .c-btn-join:hover { background: rgba(52,211,153,0.2); border-color: rgba(52,211,153,0.35); }

        .c-btn-open {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 600;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 7px 14px; border-radius: 9px; cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .c-btn-open:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }

        .room-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 16px 18px;
          transition: border-color 0.2s, background 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          cursor: default;
        }
        .room-card:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); transform: translateY(-2px); }
        .room-card.active-room { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.06); }

        .progress-bar {
          height: 3px; border-radius: 100px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .progress-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #6366f1, #34d399);
          transition: width 0.5s ease;
        }

        .dot-live {
          width: 6px; height: 6px; border-radius: 50%; background: #34d399;
          box-shadow: 0 0 0 0 rgba(52,211,153,0.4); animation: dotPulse 2s ease infinite; display: inline-block;
        }
        @keyframes dotPulse {
          0%  { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
          100%{ box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }

        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.34,1,0.64,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stagger-1 { animation: fadeIn 0.4s cubic-bezier(0.34,1,0.64,1) 0.05s both; }
        .stagger-2 { animation: fadeIn 0.4s cubic-bezier(0.34,1,0.64,1) 0.15s both; }
        .stagger-3 { animation: fadeIn 0.4s cubic-bezier(0.34,1,0.64,1) 0.25s both; }

        .modal-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 24px;
          background: rgba(13,14,18,0.85); backdrop-filter: blur(16px);
          animation: fadeIn 0.25s ease both;
        }
        .modal-box {
          width: 100%; max-width: 440px;
          background: #0f1117; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 32px;
          animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .collab-grid { grid-template-columns: 1fr !important; }
          .collab-header { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
        }
      `}</style>

      <div className="c-root flex min-h-screen">
        <Sidebar />

        <main
          className="ml-50 flex-1 p-6 lg:p-10 relative"
          style={{ minWidth: 0 }}
        >
          {/* HEADER */}
          <div
            className="stagger-1 collab-header"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 32,
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span className="dot-live" />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  Espace collaboratif
                </span>
              </div>
              <h1
                className="c-serif"
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 400,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                Salle de{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #c7d2fe, #a5f3fc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  collaboration
                </span>
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.3)",
                  lineHeight: 1.6,
                }}
              >
                Décidez ensemble en temps réel avec votre équipe.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingTop: 4,
                flexShrink: 0,
              }}
            >
              {/* Plan badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 10,
                  background: tierBg,
                  border: `1px solid ${tierBorder}`,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: tierColor,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: tierColor,
                  }}
                >
                  {tier}
                </span>
              </div>

              {canCreate ? (
                <button
                  className="c-btn-primary"
                  onClick={() => setShowCreate(true)}
                >
                  + Créer une salle
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z"
                      stroke="#f87171"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(248,113,113,0.8)",
                      fontWeight: 600,
                    }}
                  >
                    Pro requis
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div
            className="collab-grid stagger-2"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 16,
            }}
          >
            {/* LEFT — ROOMS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  Salles disponibles
                </p>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                  {rooms.length}
                </span>
              </div>

              {rooms.length === 0 ? (
                <div
                  style={{
                    padding: "32px 20px",
                    borderRadius: 16,
                    textAlign: "center",
                    border: "1px dashed rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.01)",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>
                    🏠
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.25)",
                      lineHeight: 1.6,
                    }}
                  >
                    Aucune salle pour l&apos;instant.
                    {canCreate ? " Créez-en une !" : ""}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: "calc(100vh - 280px)",
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {rooms.map((r) => {
                    const isActive = activeRoom === r.id;
                    const memberPct = Math.min(
                      100,
                      ((r.members?.length ?? 0) / (r.maxMembers ?? 10)) * 100,
                    );
                    return (
                      <div
                        key={r.id}
                        className={`room-card ${isActive ? "active-room" : ""}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 3,
                              }}
                            >
                              {isActive && <span className="dot-live" />}
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: isActive
                                    ? "#fff"
                                    : "rgba(255,255,255,0.8)",
                                   overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {r.name}
                              </p>
                            </div>
                            {r.createdBy && (
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.25)",
                                }}
                              >
                                par {r.createdBy}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: 6,
                              background:
                                r.tier === "premium"
                                  ? "rgba(245,158,11,0.1)"
                                  : "rgba(129,140,248,0.1)",
                              color:
                                r.tier === "premium" ? "#f59e0b" : "#818cf8",
                              border: `0.5px solid ${r.tier === "premium" ? "rgba(245,158,11,0.2)" : "rgba(129,140,248,0.2)"}`,
                              flexShrink: 0,
                            }}
                          >
                            {r.tier ?? "pro"}
                          </span>
                        </div>

                        {/* Members progress */}
                        <div style={{ marginBottom: 10 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.25)",
                              }}
                            >
                              Membres
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.35)",
                                fontWeight: 600,
                              }}
                            >
                              {r.members?.length ?? 0}/{r.maxMembers ?? 10}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${memberPct}%` }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            className="c-btn-join"
                            onClick={() => joinRoom(r.id, r.name)}
                            style={{ flex: 1, minWidth: 120 }}
                          >
                            Rejoindre
                          </button>
                          <button
                            className="c-btn-open"
                            onClick={() => {
                              setActiveRoom(r.id);
                              setActiveRoomName(r.name);
                            }}
                            style={{ minWidth: 120 }}
                          >
                            Ouvrir
                          </button>
                          {r.isCreator && (
                            <button
                              className="c-btn-ghost"
                              onClick={() => requestDeleteRoom(r.id, r.name)}
                              disabled={deleteLoading === r.id}
                              style={{
                                minWidth: 120,
                                color: "#f87171",
                                borderColor: "rgba(248,113,113,0.25)",
                                background: "rgba(248,113,113,0.08)",
                              }}
                            >
                              {deleteLoading === r.id ? "Suppression..." : "Supprimer"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT — CHAT */}
            <div style={{ minHeight: 500 }}>
              {activeRoom ? (
                <div className="fade-in" style={{ height: "100%" }}>
                  {/* Room header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      marginBottom: 12,
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span className="dot-live" />
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {activeRoomName}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          Session active
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {activeRoomDetails?.isCreator && (
                        <button
                          className="c-btn-ghost"
                          onClick={() => requestDeleteRoom(activeRoom!, activeRoomName)}
                          disabled={deleteLoading === activeRoom}
                          style={{
                            color: "#f87171",
                            borderColor: "rgba(248,113,113,0.25)",
                            background: "rgba(248,113,113,0.08)",
                          }}
                        >
                          {deleteLoading === activeRoom ? "Suppression..." : "Supprimer la salle"}
                        </button>
                      )}
                      <button
                        className="c-btn-ghost"
                        onClick={() => {
                          setActiveRoom(null);
                          setActiveRoomName("");
                        }}
                      >
                        ✕ Quitter
                      </button>
                    </div>
                  </div>
                  <ChatRoom
                    roomId={activeRoom}
                    tier={tier}
                    onClose={() => {
                      setActiveRoom(null);
                      setActiveRoomName("");
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: "100%",
                    minHeight: 400,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 20,
                    border: "1px dashed rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.01)",
                    textAlign: "center",
                    padding: 32,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      marginBottom: 20,
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path
                        d="M4 6h14M4 10h8M4 14h5"
                        stroke="rgba(165,180,252,0.6)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 13l3 3-3 3"
                        stroke="rgba(165,180,252,0.4)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 8,
                    }}
                  >
                    Aucune salle sélectionnée
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.2)",
                      lineHeight: 1.6,
                      maxWidth: 260,
                    }}
                  >
                    Rejoignez ou ouvrez une salle pour commencer à collaborer en
                    temps réel.
                  </p>
                  {canCreate && (
                    <button
                      className="c-btn-primary"
                      style={{ marginTop: 20 }}
                      onClick={() => setShowCreate(true)}
                    >
                      + Créer une salle
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {pendingDelete ? (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "rgba(248,113,113,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7L18 7"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 7.5L18.2 19.8C18.1316 20.6926 17.3658 21.375 16.4709 21.375H7.52909C6.6342 21.375 5.86836 20.6926 5.8 19.8L5 7.5"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 11V17"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 11V17"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Supprimer la salle ?
              </h2>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Cette action supprimera définitivement la salle et toutes les données associées.
                Cette opération est irréversible.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 24,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="c-btn-ghost"
                onClick={closeDeleteModal}
                disabled={deleteLoading !== null}
                style={{ minWidth: 120 }}
              >
                Annuler
              </button>
              <button
                className="c-btn-primary"
                onClick={() => deleteRoom(pendingDelete.id)}
                disabled={deleteLoading === pendingDelete.id}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  minWidth: 120,
                }}
              >
                {deleteLoading === pendingDelete.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* MODAL CREATE */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 10,
                }}
              >
                Nouvelle salle
              </p>
              <h2
                className="c-serif"
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 400,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                Créer un espace
              </h2>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 8,
                }}
              >
                Nom de la salle
              </label>
              <input
                className="c-input"
                placeholder="Ex: Stratégie Q3, Décision produit..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createRoom()}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                className="c-btn-primary"
                onClick={createRoom}
                disabled={creating || !name.trim()}
                style={{ flex: 1 }}
              >
                {creating ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <svg
                      className="spin"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="55"
                        strokeDashoffset="18"
                        strokeLinecap="round"
                      />
                    </svg>
                    Création...
                  </span>
                ) : (
                  "Créer la salle →"
                )}
              </button>
              <button
                className="c-btn-ghost"
                onClick={() => setShowCreate(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
