"use client";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom({
  roomId,
  tier,
  onClose,
}: {
  roomId: string;
  tier: string;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [choiceText, setChoiceText] = useState("");
  const [choiceNote, setChoiceNote] = useState("");
  const [choices, setChoices] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      const [messagesRes, choicesRes] = await Promise.all([
        fetch(`/api/collab/rooms/${roomId}/messages`),
        fetch(`/api/collab/rooms/${roomId}/choices`),
      ]);
      const messagesData = await messagesRes.json();
      const choicesData = await choicesRes.json();
      setMessages(messagesData.messages ?? []);
      setChoices(choicesData.choices ?? []);
    }
    load();

    const normalizeSocketUrl = (raw: string) => {
      try {
        const url = new URL(raw);
        const isLocalhost = ["localhost", "127.0.0.1"].includes(url.hostname);
        if (!isLocalhost && url.protocol === "https:") {
          url.port = "";
          return url.toString().replace(/\/$/, "");
        }
        return raw;
      } catch {
        return raw;
      }
    };

    const socketUrlRaw =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? window.location.origin.replace(/:\d+$/, ":4000")
        : window.location.origin);
    const socketUrl = normalizeSocketUrl(socketUrlRaw);
    import("socket.io-client")
      .then(({ io }) => {
        const socket = io(socketUrl);
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

  useEffect(() => {
    // auto-scroll to bottom when messages change
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    try {
      const res = await fetch(`/api/collab/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      setText("");
    } catch (e) {
      console.error("Failed to send message", e);
      alert("Erreur d'envoi");
    }
  }

  async function submitChoice() {
    if (!choiceText.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`/api/collab/rooms/${roomId}/choices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice: choiceText.trim(),
          note: choiceNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);
      setChoices((current) => [...current, data.choice]);
      setChoiceText("");
      setChoiceNote("");
    } catch (e) {
      console.error("Failed to submit choice", e);
      alert("Erreur lors de l'enregistrement du choix");
    } finally {
      setAiLoading(false);
    }
  }

  async function exportChoicesPdf() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/collab/rooms/${roomId}/choices/pdf`);
      if (!res.ok) {
        const error = await res.json();
        return alert(error.error || "Impossible de générer le PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `choix-${roomId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export PDF", e);
      alert("Erreur d'export PDF");
    } finally {
      setExporting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
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

  async function generateAiSummary() {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch(`/api/collab/rooms/${roomId}/ai-summary`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setMessages((m) => [...m, data.message]);
    } catch (e) {
      console.error("Failed to generate AI summary", e);
      alert("Erreur de génération IA");
    } finally {
      setAiLoading(false);
    }
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

      <div
        ref={messagesRef}
        className="h-64 overflow-y-auto mb-3 p-2 bg-[#08080a] rounded"
      >
        {messages.length === 0 && (
          <div className="text-sm text-white/50">
            Aucun message pour le moment. Envoyez le premier message !
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-3 p-2 rounded ${m.isAi ? "bg-yellow-900/10 text-yellow-200" : "bg-white/2 text-white"}`}
          >
            <div className="text-xs text-white/60 flex items-center justify-between">
              <div>{m.senderName ?? (m.isAi ? "Assistant IA" : "Anonyme")}</div>
              <div>{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
            <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
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

      <div className="mb-4 p-4 rounded bg-[#080811] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-white">
              Annonce de choix
            </div>
            <div className="text-xs text-slate-400">
              Dites à l'IA que vous avez pris une décision et elle la postera
              dans le salon.
            </div>
          </div>
          <button
            onClick={submitChoice}
            disabled={aiLoading || !choiceText.trim()}
            className={`px-4 py-2 rounded ${choiceText.trim() ? "bg-fuchsia-600 hover:bg-fuchsia-700" : "bg-white/10 text-white/60 cursor-not-allowed"}`}
          >
            {aiLoading ? "Publication..." : "J'ai fait un choix"}
          </button>
        </div>

        <div className="grid gap-3">
          <input
            value={choiceText}
            onChange={(e) => setChoiceText(e.target.value)}
            placeholder="Votre choix (ex: choisir la date, valider l'offre, lancer le test...)"
            className="w-full px-3 py-2 rounded bg-[#101017] border border-white/10"
          />
          <textarea
            value={choiceNote}
            onChange={(e) => setChoiceNote(e.target.value)}
            placeholder="Détails optionnels ou contexte pour l'équipe"
            className="w-full px-3 py-2 rounded bg-[#101017] border border-white/10 resize-none h-24"
          />
        </div>
      </div>

      <div className="mb-4 p-4 rounded bg-[#080811] border border-white/10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-sm font-semibold text-white">
              Tableau des choix
            </div>
            <div className="text-xs text-slate-400">
              Tous les choix partagés par le salon sont affichés ici.
            </div>
          </div>
          {tier === "pro" || tier === "premium" ? (
            <button
              onClick={exportChoicesPdf}
              disabled={exporting}
              className={`px-4 py-2 rounded ${exporting ? "bg-white/10 text-white/60 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"}`}
            >
              {exporting ? "Export en cours..." : "Exporter en PDF"}
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              Export PDF réservé aux plans Pro/Premium
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-3 py-2 text-slate-300">Membre</th>
                <th className="px-3 py-2 text-slate-300">Choix</th>
                <th className="px-3 py-2 text-slate-300">Détails</th>
                <th className="px-3 py-2 text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {choices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-slate-500">
                    Aucun choix enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                choices.map((choice) => (
                  <tr
                    key={choice.id}
                    className="bg-white/5 backdrop-blur-sm rounded-lg"
                  >
                    <td className="px-3 py-3 text-white/90">
                      {choice.userName}
                    </td>
                    <td className="px-3 py-3 text-white/90">{choice.choice}</td>
                    <td className="px-3 py-3 text-slate-300">
                      {choice.note || "-"}
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {new Date(choice.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 items-end flex-wrap">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message. Entrée = envoyer, Shift+Entrée = retour à la ligne"
          className="flex-1 px-3 py-2 rounded bg-[#101017] resize-none h-20"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={generateAiSummary}
            disabled={aiLoading}
            className={`px-4 py-2 rounded ${aiLoading ? "bg-white/10 text-white/60 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
          >
            {aiLoading ? "Génération IA..." : "Résumé IA"}
          </button>
          <button
            onClick={send}
            disabled={!text.trim()}
            className={`px-4 py-2 rounded ${text.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white/10 text-white/60 cursor-not-allowed"}`}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
