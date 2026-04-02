"use client";

import { useState } from "react";
import { formatChatTime } from "../utils/formatChatTime";

type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
};

export default function ChatPanel({
  messages,
  onSend,
  roomCode,
}: {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  roomCode?: string;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Chat stanza</h3>
        {roomCode && (
          <span className="text-xs text-slate-400">{roomCode}</span>
        )}
      </div>

      <div className="h-56 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500">
            Nessun messaggio...
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-2"
          >
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-semibold text-amber-300">
                {msg.playerName}
              </span>
              <span>{formatChatTime(msg.timestamp)}</span>
            </div>

            <div className="text-sm text-white mt-1">
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi un messaggio..."
          maxLength={250}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
        />

        <button
          onClick={handleSend}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Invia
        </button>
      </div>
    </div>
  );
}