import { api } from "./api";

export interface ChatMessage {
  id: number;
  from_role: "owner" | "customer";
  text: string;
  timestamp: string;
  read: boolean;
}

export async function fetchChatMessages(bookingId: number): Promise<ChatMessage[]> {
  try {
    const res = await api.get<{ xabarlar: ChatMessage[]; soni: number; o_qilmagan: number }>(
      `/chat/${bookingId}`
    );
    return res.xabarlar || [];
  } catch {
    return [];
  }
}

export async function getUnreadCount(bookingId: number): Promise<number> {
  try {
    const res = await api.get<{ o_qilmagan: number }>(`/chat/${bookingId}`);
    return res.o_qilmagan || 0;
  } catch {
    return 0;
  }
}

export async function sendChatMessage(
  bookingId: number,
  text: string
): Promise<ChatMessage | null> {
  try {
    const res = await api.post<{ xabar: ChatMessage }>(`/chat/${bookingId}`, { text });
    return res.xabar || null;
  } catch {
    return null;
  }
}

export async function markChatRead(bookingId: number): Promise<void> {
  try {
    await api.put(`/chat/${bookingId}/read`);
  } catch {}
}
