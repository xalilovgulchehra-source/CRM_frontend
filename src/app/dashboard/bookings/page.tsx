"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import type { Booking, Client, Service } from "@/types";

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", date: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Booking["status"] | "">("");

  const load = useCallback(() => {
    setLoading(true);
    const q = filter ? `?status=${filter}` : "";
    Promise.all([
      api.get<{ navbatlar: Booking[]; soni: number }>(`/bookings${q}`).catch(() => ({ navbatlar: [], soni: 0 })),
      api.get<{ mijozlar: Client[]; soni: number }>("/clients").catch(() => ({ mijozlar: [], soni: 0 })),
      api.get<{ xizmatlar: Service[]; soni: number }>("/services").catch(() => ({ xizmatlar: [], soni: 0 })),
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
    } catch {
      // silent
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Navbatni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      load();
    } catch {
      // silent
    }
  }

  return (
    <div>
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
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Holat</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{b.client?.fullName || b.clientId}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{b.service?.name || b.serviceId}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {new Date(b.date).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-1 focus:ring-gray-900 cursor-pointer ${statusColors[b.status] || ""}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDelete(b.id)} className="text-sm text-red-500 hover:text-red-700">
                          O&apos;chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:hidden divide-y divide-gray-50">
              {bookings.map((b) => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{b.client?.fullName || b.clientId}</p>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:text-red-700">O&apos;chirish</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {b.service?.name || b.serviceId} · {new Date(b.date).toLocaleDateString("uz-UZ")}
                  </p>
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-1 focus:ring-gray-900 cursor-pointer ${statusColors[b.status] || ""}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
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