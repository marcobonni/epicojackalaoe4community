"use client";

import { useEffect, useRef, useState } from "react";
import { formatChatTime } from "../utils/formatChatTime";

type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: number;
};

export default function ChatPanel({
  roomCode,
  currentPlayerName,
  messages,
  onSend,
  disabled = false,
}: {
  roomCode?: string;
  currentPlayerName?: string;
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const cleaned = text.trim();
    if (!cleaned || sending || disabled) return;

    setSending(true);
    await onSend(cleaned);
    setSending(false);
    setText("");
  };

  return (
    <div className="rounded-3xl border border-[#3a2621] bg-[#0b0708]/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">Chat stanza</h3>
        {roomCode ? (
          <span className="rounded-full border border-[#4b312a] bg-[#140c0d] px-3 py-1 text-xs text-[#d8cbb7]">
            {roomCode}
          </span>
        ) : null}
      </div>

      <div className="mt-4 h-72 overflow-y-auto rounded-2xl border border-[#3a2621] bg-[#140c0d]/60 p-3">
        {messages.length === 0 ? (
          <div className="text-sm text-[#8f7e69]">Nessun messaggio ancora.</div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwn =
                currentPlayerName &&
                message.playerName.trim().toLowerCase() ===
                  currentPlayerName.trim().toLowerCase();

              return (
                <div
                  key={message.id}
                  className={`rounded-2xl border p-3 ${
                    isOwn
                      ? "border-amber-400/20 bg-amber-400/5"
                      : "border-[#3a2621] bg-[#0b0708]/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        isOwn ? "text-amber-300" : "text-white"
                      }`}
                    >
                      {message.playerName}
                    </span>
                    <span className="text-xs text-[#8f7e69]">
                      {formatChatTime(message.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1 whitespace-pre-wrap break-words text-sm text-[#e8dcc8]">
                    {message.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={text}
          maxLength={250}
          disabled={disabled || sending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            disabled
              ? "Chat temporaneamente bloccata"
              : "Scrivi un messaggio..."
          }
          className="flex-1 rounded-2xl border border-[#4b312a] bg-[#0b0708]/70 px-4 py-3 text-sm text-[#f5ecdc] outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-60"
        />
        <button
          onClick={() => void handleSend()}
          disabled={disabled || sending || !text.trim()}
className="rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 text-sm font-semibold text-[#1a0d0c] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Invia
        </button>
      </div>

      <div className="mt-2 text-xs text-[#8f7e69]">
        Max 250 caratteri. Ultimi 100 messaggi salvati nella stanza.
      </div>
    </div>
  );
}
