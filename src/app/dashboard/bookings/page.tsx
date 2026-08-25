"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Modal } from "@/components/Modal";
import { ChatModal } from "@/components/ChatModal";
import { fetchChatMessages } from "@/lib/chat-store";
import type { Booking, Client, Service, SalonBrief } from "@/types";

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  DONE: "Tugallangan",
  CANCELLED: "Bekor qilingan",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  DONE: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
};

const statusOptions: Booking["status"][] = ["PENDING", "CONFIRMED", "DONE", "CANCELLED"];

function isBookingPast(b: Booking): boolean {
  const end = new Date(b.date);
  const dur = b.service?.durationMins || 30;
  end.setMinutes(end.getMinutes() + dur);
  return end.getTime() < Date.now();
}

function getClientName(b: Booking): string {
  return b.client?.fullName || b.clientName || `Mijoz #${b.clientId}`;
}

function getPhone(b: Booking): string | null {
  return b.client?.phone || b.clientPhone || null;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", date: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Booking["status"] | "">("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatBookingId, setChatBookingId] = useState(0);
  const [chatClientName, setChatClientName] = useState("");
  const [, setTick] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : "";
    Promise.all([
      api.get<{ navbatlar: Booking[]; soni: number }>(`/bookings${q}`).catch(() => ({ navbatlar: [] as Booking[], soni: 0 })),
      api.get<{ mijozlar: Client[]; soni: number }>("/clients").catch(() => ({ mijozlar: [] as Client[], soni: 0 })),
      api.get<{ xizmatlar: Service[]; soni: number }>("/services").catch(() => ({ xizmatlar: [] as Service[], soni: 0 })),
    ])
      .then(([b, c, s]) => {
        setBookings(b.navbatlar);
        setClients(c.mijozlar);
        setServices(s.xizmatlar);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (bookings.length === 0) return;
    bookings.forEach((b) => {
      if ((b.status === "PENDING" || b.status === "CONFIRMED") && isBookingPast(b)) {
        api.put(`/bookings/${b.id}`, { status: "DONE" }).then(() => {
          setBookings((prev) =>
            prev.map((x) => (x.id === b.id ? { ...x, status: "DONE" as const } : x))
          );
        }).catch(() => {});
      }
    });
  }, [bookings]);

  const [, setUnreadMap] = useState<Record<number, number>>({});

  useEffect(() => {
    if (bookings.length === 0) return;
    const check = async () => {
      const map: Record<number, number> = {};
      for (const b of bookings) {
        const msgs = await fetchChatMessages(b.id);
        const unread = msgs.filter((m) => m.from === "customer" && !m.read).length;
        if (unread > 0) map[b.id] = unread;
      }
      setUnreadMap(map);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [bookings]);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("chat-new-message", handler);
    return () => window.removeEventListener("chat-new-message", handler);
  }, []);

  function openChat(bookingId: number, clientName: string) {
    setChatBookingId(bookingId);
    setChatClientName(clientName);
    setChatOpen(true);
  }

  function openCreate() {
    setForm({ clientId: "", serviceId: "", date: "", notes: "" });
    setError("");
    setModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const selectedService = services.find((s) => s.id === Number(form.serviceId));
      if (!selectedService) {
        setError("Xizmatni tanlang");
        setSaving(false);
        return;
      }
      await api.post("/bookings", {
        clientId: Number(form.clientId),
        serviceId: Number(form.serviceId),
        date: form.date,
        price: selectedService.price,
        notes: form.notes || undefined,
      });
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await api.put(`/bookings/${id}`, { status });
      load();
    } catch {}
  }

  async function handleDelete(id: number) {
    if (!confirm("Navbatni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      load();
    } catch {}
  }

  return (
    <div>
      {chatOpen && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          bookingId={chatBookingId}
          clientName={chatClientName}
          role="owner"
          title={chatClientName}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Navbatlar</h1>
          <p className="text-sm text-gray-500 mt-1">Jami {bookings.length} ta navbat</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          + Navbat qo&apos;shish
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            filter === "" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          Hammasi
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : bookings.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Navbatlar topilmadi</div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Mijoz</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Xizmat</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Sana</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Narx</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Holat</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{getClientName(b)}</p>
                          {getPhone(b) && (
                            <p className="text-xs text-gray-400 mt-0.5">{getPhone(b)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{b.service?.name || b.serviceId}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {new Date(b.date).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">
                        {b.price.toLocaleString("uz-UZ")} so&apos;m
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-1 focus:ring-gray-900 cursor-pointer ${statusColors[b.status] || ""}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openChat(b.id, getClientName(b))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75L3.75 20.105z" />
                            </svg>
                            Chat
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5"
                          >
                            O&apos;chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden divide-y divide-gray-50">
              {bookings.map((b) => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{getClientName(b)}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[b.status] || ""}`}>
                      {statusLabels[b.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {b.service?.name || b.serviceId} &middot; {new Date(b.date).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    {b.price.toLocaleString("uz-UZ")} so&apos;m
                  </p>
                  {b.notes && !b.notes.startsWith("[CHAT]") && <p className="text-xs text-gray-400 mb-2">{b.notes}</p>}
                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-1 focus:ring-gray-900 cursor-pointer ${statusColors[b.status] || ""}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => openChat(b.id, getClientName(b))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75L3.75 20.105z" />
                      </svg>
                      Chat
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5"
                    >
                      O&apos;chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yangi navbat">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mijoz *</label>
            <select
              required
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="">Mijozni tanlang</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat *</label>
            <select
              required
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            >
              <option value="">Xizmatni tanlang</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.price.toLocaleString("uz-UZ")} so&apos;m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sana *</label>
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eslatmalar</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Yaratilmoqda..." : "Yaratish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
