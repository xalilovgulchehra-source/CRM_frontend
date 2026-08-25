export interface ChatMessage {
  id: string;
  conversationId: string;
  salonId: number;
  clientId: number;
  from: "owner" | "customer";
  text: string;
  timestamp: number;
  read: boolean;
}

const PREFIX = "crm_chat_";

function getConversationKey(salonId: number, clientId: number): string {
  return `${PREFIX}${salonId}_${clientId}`;
}

export function getMessages(salonId: number, clientId: number): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const key = getConversationKey(salonId, clientId);
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function sendMessage(
  salonId: number,
  clientId: number,
  from: "owner" | "customer",
  text: string
): ChatMessage {
  const msg: ChatMessage = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    conversationId: `${salonId}_${clientId}`,
    salonId,
    clientId,
    from,
    text,
    timestamp: Date.now(),
    read: false,
  };
  const messages = getMessages(salonId, clientId);
  messages.push(msg);
  const key = getConversationKey(salonId, clientId);
  localStorage.setItem(key, JSON.stringify(messages));
  window.dispatchEvent(new CustomEvent("chat-new-message", { detail: msg }));
  return msg;
}

export function markRead(salonId: number, clientId: number, forRole: "owner" | "customer") {
  const messages = getMessages(salonId, clientId);
  let changed = false;
  messages.forEach((m) => {
    if (m.from !== forRole && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(getConversationKey(salonId, clientId), JSON.stringify(messages));
  }
}

export function getUnreadCount(salonId: number, clientId: number, forRole: "owner" | "customer"): number {
  return getMessages(salonId, clientId).filter((m) => m.from !== forRole && !m.read).length;
}

export function getAllUnreadForCustomer(): { salonId: number; clientId: number; count: number }[] {
  if (typeof window === "undefined") return [];
  const result: { salonId: number; clientId: number; count: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      const parts = key.replace(PREFIX, "").split("_");
      const salonId = Number(parts[0]);
      const clientId = Number(parts[1]);
      const count = getUnreadCount(salonId, clientId, "customer");
      if (count > 0) result.push({ salonId, clientId, count });
    }
  }
  return result;
}
