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
      <div className="p-6 text-white">
        <h1 className="text-2xl mb-4">Collaboration (Pro / Premium)</h1>

        <div className="mb-6">
          <p className="text-sm text-white/60 mb-2">
            Plan actuel : <strong>{tier}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la salle"
              className="px-3 py-2 rounded bg-[#111118] border border-white/10 flex-1 min-w-60"
            />
            <button
              onClick={createRoom}
              disabled={!canCreate}
              className={`px-3 py-2 rounded text-white transition ${canCreate ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white/10 text-white/60 cursor-not-allowed"}`}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Mes salles</h3>
            <ul>
              {rooms.map((r) => (
                <li key={r.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-white/60">
                        Membres: {r.members?.length ?? 0} • Max: {r.maxMembers}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => joinRoom(r.id)}
                        className="px-2 py-1 rounded bg-green-600 text-sm"
                      >
                        Rejoindre
                      </button>
                      <button
                        onClick={() => setActiveRoom(r.id)}
                        className="px-2 py-1 rounded bg-gray-700 text-sm"
                      >
                        Ouvrir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {activeRoom ? (
              <ChatRoom roomId={activeRoom} onClose={() => setActiveRoom(null)} />
            ) : (
              <div className="text-white/60">
                Sélectionnez ou rejoignez une salle pour commencer le chat.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}