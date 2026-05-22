"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/collab/rooms/${roomId}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
    load();

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? window.location.origin.replace(/:\d+$/, ":4000")
        : window.location.origin);
    import("socket.io-client")
      .then(({ io }) => {
        const socket = io(socketUrl, { transports: ["websocket"] });
        socket.emit("join", roomId);
        socket.on("message", (payload: any) => {
          setMessages((m) => [...m, payload]);
        });
        socket.on("connect_error", (err: any) =>
          console.error("Socket connect error", err),
        );
        socketRef.current = socket;
      })
      .catch((e) => console.error("Failed to load socket.io-client", e));

    return () => {
      socketRef.current?.disconnect?.();
    };
  }, [roomId]);

  async function send() {
    if (!text.trim()) return;
    const res = await fetch(`/api/collab/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setText("");
  }

  async function invite() {
    if (!inviteEmail.trim()) return;
    const res = await fetch(`/api/collab/rooms/${roomId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    });
    const data = await res.json();
    if (data.error) {
      setInviteStatus(data.error);
      return;
    }
    setInviteStatus("Invitation envoyée !");
    setInviteEmail("");
  }

  return (
    <div className="p-4 bg-[#0b0b10] rounded">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Salle: {roomId}</div>
        <div>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-700">
            Fermer
          </button>
        </div>
      </div>

      <div className="h-64 overflow-y-auto mb-3 p-2 bg-[#08080a] rounded">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 ${m.isAi ? "text-yellow-200" : "text-white"}`}
          >
            <div className="text-xs text-white/60">
              {m.senderName ?? (m.isAi ? "Assistant IA" : "Anonyme")} •{" "}
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            <div className="mt-1">{m.content}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 mb-4">
        <div className="flex gap-2">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email à inviter"
            className="flex-1 px-3 py-2 rounded bg-[#101017] border border-white/10"
          />
          <button onClick={invite} className="px-3 py-2 rounded bg-emerald-600">
            Inviter
          </button>
        </div>
        {inviteStatus && (
          <p className="text-sm text-white/70">{inviteStatus}</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-[#101017]"
        />
        <button onClick={send} className="px-3 py-2 rounded bg-indigo-600">
          Envoyer
        </button>
      </div>
    </div>
  );
}
