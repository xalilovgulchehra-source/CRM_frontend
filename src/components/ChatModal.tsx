"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, markRead, type ChatMessage } from "@/lib/chat-store";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  salonId: number;
  clientId: number;
  clientName: string;
  role: "owner" | "customer";
  title?: string;
}

export function ChatModal({ open, onClose, salonId, clientId, clientName, role, title }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    markRead(salonId, clientId, role);
    setMessages(getMessages(salonId, clientId));

    const handler = () => {
      if (open) setMessages(getMessages(salonId, clientId));
    };
    window.addEventListener("chat-new-message", handler);
    return () => window.removeEventListener("chat-new-message", handler);
  }, [open, salonId, clientId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setMessages(getMessages(salonId, clientId));
    }, 2000);
    return () => clearInterval(interval);
  }, [open, salonId, clientId]);

  if (!open) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(salonId, clientId, role, text.trim());
    setText("");
    setMessages(getMessages(salonId, clientId));
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-xl h-[80vh] sm:h-[500px] flex flex-col shadow-xl animate-slide-down">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title || clientName}</h3>
            <p className="text-xs text-gray-500">Chat</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75L3.75 20.105z" />
              </svg>
              <p className="text-xs text-gray-400">Xabar yozing...</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.from === role;
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isMine
                      ? "bg-gray-900 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-gray-400" : "text-gray-400"}`}>
                      {formatTime(m.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Xabar yozing..."
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
