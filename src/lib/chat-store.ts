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
  return notes
    .split("\n")
    .filter((l) => l.startsWith(CHAT_PREFIX))
    .map((line) => {
      const parts = line.split("|");
      if (parts.length < 6) return null;
      return {
        id: parts[1],
        from: parts[2] as "owner" | "customer",
        read: parts[3] === "R",
        timestamp: Number(parts[4]),
        text: parts.slice(5).join("|"),
      };
    })
    .filter(Boolean) as ChatMessage[];
}

export async function fetchChatMessages(bookingId: number, role: "owner" | "customer"): Promise<ChatMessage[]> {
  try {
    let notes = "";
    if (role === "owner") {
      const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
      notes = res.navbat?.notes || "";
    } else {
      const res = await api.get<{ navbatlar: { id: number; notes?: string }[] }>("/my-bookings");
      const booking = (res.navbatlar || []).find((b) => b.id === bookingId);
      notes = booking?.notes || "";
    }
    return deserializeMessages(notes);
  } catch {
    return [];
  }
}

export async function sendChatMessage(
  bookingId: number,
  from: "owner" | "customer",
  text: string
): Promise<ChatMessage | null> {
  try {
    const existing = await fetchChatMessages(bookingId, from);
    const existingNotesStr = existing.length > 0
      ? serializeMessages(existing)
      : "";

    const msg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from,
      text,
      timestamp: Date.now(),
      read: false,
    };

    existing.push(msg);
    const chatBlock = serializeMessages(existing);

    if (from === "owner") {
      const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
      const rawNotes = res.navbat?.notes || "";
      const nonChatLines = rawNotes.split("\n").filter((l) => !l.startsWith(CHAT_PREFIX));
      const newNotes = [...nonChatLines.filter(Boolean), chatBlock].join("\n");
      await api.put(`/bookings/${bookingId}`, { notes: newNotes });
    }
    return msg;
  } catch {
    return null;
  }
}

export async function markChatRead(bookingId: number, forRole: "owner" | "customer"): Promise<void> {
  try {
    const messages = await fetchChatMessages(bookingId, forRole);
    let changed = false;
    messages.forEach((m) => {
      if (m.from !== forRole && !m.read) {
        m.read = true;
        changed = true;
      }
    });

    if (changed && forRole === "owner") {
      const chatBlock = serializeMessages(messages);
      const res = await api.get<{ navbat: { id: number; notes?: string } }>(`/bookings/${bookingId}`);
      const rawNotes = res.navbat?.notes || "";
      const nonChatLines = rawNotes.split("\n").filter((l) => !l.startsWith(CHAT_PREFIX));
      const newNotes = [...nonChatLines.filter(Boolean), chatBlock].join("\n");
      await api.put(`/bookings/${bookingId}`, { notes: newNotes });
    }
  } catch {}
}
