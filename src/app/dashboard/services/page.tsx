"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import type { Service } from "@/types";

const emptyService: Omit<Service, "id" | "createdAt"> = {
  name: "",
  description: "",
  price: 0,
  duration: 30,
};

function formatPrice(n: number) {
  return n.toLocaleString("uz-UZ") + " so'm";
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    api
      .get<Service[]>(`/services${q}`)
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyService);
    setError("");
    setModalOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, description: s.description || "", price: s.price, duration: s.duration });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, form);
      } else {
        await api.post("/services", form);
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xizmatni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/services/${id}`);
      load();
    } catch {
      // silent
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Xizmatlar</h1>
          <p className="text-sm text-gray-500 mt-1">Jami {services.length} ta xizmat</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          + Xizmat qo&apos;shish
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
        ) : services.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Xizmatlar topilmadi</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Nomi</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Narxi</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Davomiyligi</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{formatPrice(s.price)}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{s.duration} daqiqa</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEdit(s)} className="text-sm text-gray-600 hover:text-gray-900 mr-3">Tahrirlash</button>
                        <button onClick={() => handleDelete(s.id)} className="text-sm text-red-500 hover:text-red-700">O&apos;chirish</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-gray-50">
              {services.map((s) => (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatPrice(s.price)} · {s.duration} daq</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-gray-600 hover:text-gray-900">Tahrirlash</button>
                      <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700">O&apos;chirish</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Xizmatni tahrirlash" : "Yangi xizmat"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Kirish soch olish"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Narxi (so&apos;m) *</label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Davomiyligi (daqiqa) *</label>
              <input
                type="number"
                required
                min={1}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
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
