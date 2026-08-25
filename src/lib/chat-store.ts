import { api } from "./api";

export interface ChatMessage {
  id: string;
  from: "owner" | "customer";
  text: string;
  timestamp: number;
  read: boolean;
}

const CHAT_PREFIX = "[CHAT]";

function serializeMessages(messages: ChatMessage[]): string {
  return messages.map((m) => {
    const readFlag = m.read ? "R" : "U";
    return `${CHAT_PREFIX}|${m.id}|${m.from}|${readFlag}|${m.timestamp}|${m.text}`;
  }).join("\n");
}

function deserializeMessages(notes: string): ChatMessage[] {
  if (!notes) return [];
  return notes.split("\n").filter((l) => l.startsWith(CHAT_PREFIX)).map((line) => {
    const parts = line.split("|");
    if (parts.length < 6) return null;
    return {
      id: parts[1],
      from: parts[2] as "owner" | "customer",
      read: parts[3] === "R",
      timestamp: Number(parts[4]),
      text: parts.slice(5).join("|"),
    };
  }).filter(Boolean) as ChatMessage[];
}

function getBookingNotesKey(bookingId: number): string {
  return `crm_chat_booking_${bookingId}`;
}

let cachedBookingNotes: Record<number, string> = {};

export async function fetchChatMessages(bookingId: number): Promise<ChatMessage[]> {
  try {
    const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
    const notes = res.navbat?.notes || "";
    cachedBookingNotes[bookingId] = notes;
    return deserializeMessages(notes);
  } catch {
    return deserializeMessages(cachedBookingNotes[bookingId] || "");
  }
}

export async function sendChatMessage(
  bookingId: number,
  from: "owner" | "customer",
  text: string
): Promise<ChatMessage | null> {
  try {
    const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
    const existingNotes = res.navbat?.notes || "";

    const msg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from,
      text,
      timestamp: Date.now(),
      read: false,
    };

    const chatMessages = deserializeMessages(existingNotes);
    chatMessages.push(msg);

    const chatBlock = serializeMessages(chatMessages);
    const nonChatLines = existingNotes.split("\n").filter((l) => !l.startsWith(CHAT_PREFIX));
    const newNotes = [...nonChatLines.filter(Boolean), chatBlock].join("\n");

    await api.put(`/bookings/${bookingId}`, { notes: newNotes });
    cachedBookingNotes[bookingId] = newNotes;
    return msg;
  } catch {
    return null;
  }
}

export async function markChatRead(bookingId: number, forRole: "owner" | "customer"): Promise<void> {
  try {
    const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
    const existingNotes = res.navbat?.notes || "";
    const chatMessages = deserializeMessages(existingNotes);

    let changed = false;
    chatMessages.forEach((m) => {
      if (m.from !== forRole && !m.read) {
        m.read = true;
        changed = true;
      }
    });

    if (changed) {
      const chatBlock = serializeMessages(chatMessages);
      const nonChatLines = existingNotes.split("\n").filter((l) => !l.startsWith(CHAT_PREFIX));
      const newNotes = [...nonChatLines.filter(Boolean), chatBlock].join("\n");
      await api.put(`/bookings/${bookingId}`, { notes: newNotes });
      cachedBookingNotes[bookingId] = newNotes;
    }
  } catch {}
}
