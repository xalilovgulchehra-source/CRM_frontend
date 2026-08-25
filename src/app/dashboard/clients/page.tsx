"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import type { Client } from "@/types";

const emptyForm = { fullName: "", phone: "", notes: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    api
      .get<{ mijozlar: Client[]; soni: number }>(`/clients${q}`)
      .then((res) => setClients(res.mijozlar))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({ fullName: c.fullName, phone: c.phone, notes: c.notes || "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/clients/${editing.id}`, form);
      } else {
        await api.post("/clients", form);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Mijozni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/clients/${id}`);
      load();
    } catch {
      // silent
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mijozlar</h1>
          <p className="text-sm text-gray-500 mt-1">Jami {clients.length} ta mijoz</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          + Mijoz qo&apos;shish
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Qidirish..."
          className="w-full sm:w-72 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : clients.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Mijozlar topilmadi</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Ism</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Telefon</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Eslatma</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{c.fullName}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{c.phone}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{c.notes || "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEdit(c)} className="text-sm text-gray-600 hover:text-gray-900 mr-3">Tahrirlash</button>
                        <button onClick={() => handleDelete(c.id)} className="text-sm text-red-500 hover:text-red-700">O&apos;chirish</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-50">
              {clients.map((c) => (
                <div key={c.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{c.fullName}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-xs text-gray-600 hover:text-gray-900">Tahrirlash</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">O&apos;chirish</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{c.phone}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Mijozni tahrirlash" : "Yangi mijoz"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="+998 XX XXX XX XX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eslatmalar</label>
            <textarea
              rows={3}
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
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}