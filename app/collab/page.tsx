"use client";
import { useEffect, useState } from "react";

import ChatRoom from "../Components/Collab/ChatRoom";
import Sidebar from "../Components/Home/sidebar";

export default function CollabPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [canCreate, setCanCreate] = useState(false);

  async function fetchSubscription() {
    const res = await fetch("/api/subscription/current");
    const data = await res.json();
    if (data.subscription?.tier) {
      setTier(data.subscription.tier);
      setCanCreate(
        data.subscription.tier === "pro" ||
          data.subscription.tier === "premium",
      );
    }
  }

  async function fetchRooms() {
    const res = await fetch("/api/collab/rooms");
    const data = await res.json();
    setRooms(data.rooms ?? []);
  }

  useEffect(() => {
    fetchSubscription();
    fetchRooms();
  }, []);

  async function createRoom() {
    if (!canCreate) {
      return alert(
        "La collaboration est réservée aux abonnements Pro et Premium.",
      );
    }
    const res = await fetch("/api/collab/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.room) {
      setActiveRoom(data.room.id);
      fetchRooms();
    } else {
      alert(data.error || "Erreur");
    }
  }

  async function joinRoom(id: string) {
    const res = await fetch(`/api/collab/rooms/${id}/join`, { method: "POST" });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setActiveRoom(id);
    fetchRooms();
  }

  return (
    <>
      <Sidebar />
      <div className="p-6 text-white max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Collaboration</h1>
          <div className="text-sm text-white/60">
            Plan actuel : <strong>{tier}</strong>
          </div>
        </div>

        <div className="mb-6 bg-[#080812] p-4 rounded border border-white/6 shadow-sm">
          <div className="flex gap-3 items-center">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la salle"
              className="px-3 py-2 rounded bg-[#0f1014] border border-white/10 flex-1"
            />
            <button
              onClick={createRoom}
              disabled={!canCreate}
              className={`px-4 py-2 rounded text-white transition ${canCreate ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white/10 text-white/60 cursor-not-allowed"}`}
            >
              {canCreate ? "Créer la salle" : "Pro ou Premium requis"}
            </button>
          </div>
          {!canCreate && (
            <p className="text-xs text-red-400 mt-2">
              Vous devez être abonné Pro ou Premium pour créer une salle.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-3">Mes salles</h3>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {rooms.length === 0 && (
                <div className="text-sm text-white/60">
                  Aucune salle pour le moment.
                </div>
              )}
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded bg-linear-to-r from-[#0b0b10] to-[#0f1116] border border-white/6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-white/50 px-2 py-0.5 bg-white/3 rounded">
                          {r.tier ?? "pro"}
                        </div>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {r.members?.length ?? 0} / {r.maxMembers} membres
                      </div>
                      {r.createdBy && (
                        <div className="text-xs text-white/40 mt-1">
                          créée par {r.createdBy}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-3">
                      <button
                        onClick={() => joinRoom(r.id)}
                        className="px-3 py-1 rounded bg-emerald-600 text-sm"
                      >
                        Rejoindre
                      </button>
                      <button
                        onClick={() => setActiveRoom(r.id)}
                        className="px-3 py-1 rounded bg-gray-700 text-sm"
                      >
                        Ouvrir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {activeRoom ? (
              <ChatRoom
                roomId={activeRoom}
                onClose={() => setActiveRoom(null)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded bg-[#080812] p-6 border border-white/6">
                <div className="text-white/60 mb-2">
                  Sélectionnez ou rejoignez une salle pour commencer le chat.
                </div>
                <div className="text-sm text-white/40">
                  Pro tip: créez une salle pour inviter des membres et
                  collaborer en temps réel.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
