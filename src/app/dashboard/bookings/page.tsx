"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import type { Booking, Client, Service } from "@/types";

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  completed: "Tugallangan",
  cancelled: "Bekor qilingan",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
};

const statusOptions = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const TEXT_ADD_BOOKING = "+ Navbat qo'shish";
const TEXT_DELETE = "O'chirish";
const TEXT_CONFIRM_DELETE = "Navbatni o'chirmoqchimisiz?";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    serviceId: "",
    date: "",
    notes: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const query = filter ? `?status=${filter}` : "";

      const [bookingsData, clientsData, servicesData] =
        await Promise.all([
          api.get<Booking[]>(`/bookings${query}`),
          api.get<Client[]>("/clients"),
          api.get<Service[]>("/services"),
        ]);

      setBookings(bookingsData);
      setClients(clientsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);

      setBookings([]);
      setClients([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // =========================
  // CREATE BOOKING
  // =========================

  function openCreate() {
    setForm({
      clientId: "",
      serviceId: "",
      date: "",
      notes: "",
    });

    setError("");
    setModalOpen(true);
  }

  async function handleCreate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.clientId || !form.serviceId || !form.date) {
      setError(
        "Iltimos, barcha majburiy maydonlarni to'ldiring."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/bookings", {
        clientId: form.clientId,
        serviceId: form.serviceId,
        date: form.date,
        notes: form.notes,
      });

      setModalOpen(false);

      setForm({
        clientId: "",
        serviceId: "",
        date: "",
        notes: "",
      });

      await load();
    } catch (err: unknown) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Navbat yaratishda xatolik yuz berdi."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // UPDATE STATUS
  // =========================

  async function updateStatus(
    id: string | number,
    status: string
  ) {
    try {
      await api.put(`/bookings/${id}`, {
        status,
      });

      await load();
    } catch (error) {
      console.error(
        "Statusni o'zgartirishda xatolik:",
        error
      );
    }
  }

  // =========================
  // DELETE
  // =========================

  async function handleDelete(id: string | number) {
    if (!confirm(TEXT_CONFIRM_DELETE)) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);
      await load();
    } catch (error) {
      console.error(
        "Navbatni o'chirishda xatolik:",
        error
      );
    }
  }

  // =========================
  // HELPERS
  // =========================

function getClientName(id: string | number) {
  const client = clients.find(
    (client) => String(client.id) === String(id)
  );

  if (!client) {
    return String(id);
  }

  return client.fullName;
}
  function getServiceName(id: string | number) {
    const service = services.find(
      (service) => String(service.id) === String(id)
    );

    if (!service) {
      return String(id);
    }

    return service.name || String(id);
  }

  function formatDate(date: string) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("uz-UZ");
  }

  // =========================
  // FILTER BUTTONS
  // =========================

  const filterButtons = statusOptions.map((status) => (
    <button
      key={status}
      type="button"
      onClick={() => setFilter(status)}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
        filter === status
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      }`}
    >
      {statusLabels[status]}
    </button>
  ));

  // =========================
  // STATUS OPTIONS
  // =========================

  const selectStatusOptions = statusOptions.map((status) => (
    <option key={status} value={status}>
      {statusLabels[status]}
    </option>
  ));

  // =========================
  // CLIENT OPTIONS
  // =========================
const clientSelectOptions = clients.map((client) => (
  <option
    key={String(client.id)}
    value={String(client.id)}
  >
    {client.fullName}
  </option>
));
  // =========================
  // SERVICE OPTIONS
  // =========================

  const serviceSelectOptions = services.map((service) => (
    <option
      key={String(service.id)}
      value={String(service.id)}
    >
      {service.name}
    </option>
  ));

  // =========================
  // DESKTOP TABLE
  // =========================

  const desktopTableRows = bookings.map((booking) => (
    <tr
      key={booking.id}
      className="hover:bg-gray-50/50 transition-colors"
    >
      <td className="px-5 py-3 text-sm font-medium text-gray-900">
        {getClientName(booking.clientId)}
      </td>

      <td className="px-5 py-3 text-sm text-gray-600">
        {getServiceName(booking.serviceId)}
      </td>

      <td className="px-5 py-3 text-sm text-gray-600">
        {formatDate(booking.date)}
      </td>

      <td className="px-5 py-3">
        <select
          value={booking.status}
          onChange={(e) =>
            updateStatus(booking.id, e.target.value)
          }
          className={`text-xs font-medium px-2.5 py-1 rounded-full border focus:ring-1 focus:ring-gray-900 cursor-pointer ${
            statusColors[booking.status] || ""
          }`}
        >
          {selectStatusOptions}
        </select>
      </td>

      <td className="px-5 py-3 text-right">
        <button
          type="button"
          onClick={() => handleDelete(booking.id)}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          {TEXT_DELETE}
        </button>
      </td>
    </tr>
  ));

  // =========================
  // MOBILE LIST
  // =========================

  const mobileListItems = bookings.map((booking) => (
    <div
      key={booking.id}
      className="px-5 py-4"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">
          {getClientName(booking.clientId)}
        </p>

        <button
          type="button"
          onClick={() => handleDelete(booking.id)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          {TEXT_DELETE}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        {getServiceName(booking.serviceId)} ·{" "}
        {formatDate(booking.date)}
      </p>

      <select
        value={booking.status}
        onChange={(e) =>
          updateStatus(booking.id, e.target.value)
        }
        className={`text-xs font-medium px-2.5 py-1 rounded-full border focus:ring-1 focus:ring-gray-900 cursor-pointer ${
          statusColors[booking.status] || ""
        }`}
      >
        {selectStatusOptions}
      </select>
    </div>
  ));

  // =========================
  // RETURN
  // =========================

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Navbatlar
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Jami {bookings.length} ta navbat
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          {TEXT_ADD_BOOKING}
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            filter === ""
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          Hammasi
        </button>

        {filterButtons}
      </div>

      {/* BOOKINGS */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            Yuklanmoqda...
          </div>
        ) : bookings.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            Navbatlar topilmadi
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                      Mijoz
                    </th>

                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                      Xizmat
                    </th>

                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                      Sana
                    </th>

                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                      Holat
                    </th>

                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                      Amallar
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {desktopTableRows}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden divide-y divide-gray-50">
              {mobileListItems}
            </div>
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
          }
        }}
        title="Yangi navbat"
      >
        <form
          onSubmit={handleCreate}
          className="space-y-4 pt-2"
        >
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* CLIENT */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mijoz
            </label>

            <select
              required
              value={form.clientId}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientId: e.target.value,
                })
              }
              className="w-full text-sm border-gray-200 rounded-md focus:border-gray-950 focus:ring-gray-950"
            >
              <option value="">Tanlang</option>
              {clientSelectOptions}
            </select>
          </div>

          {/* SERVICE */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Xizmat
            </label>

            <select
              required
              value={form.serviceId}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceId: e.target.value,
                })
              }
              className="w-full text-sm border-gray-200 rounded-md focus:border-gray-950 focus:ring-gray-950"
            >
              <option value="">Tanlang</option>
              {serviceSelectOptions}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sana
            </label>

            <input
              type="date"
              required
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
              className="w-full text-sm border-gray-200 rounded-md focus:border-gray-950 focus:ring-gray-950"
            />
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Izoh
            </label>

            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              rows={3}
              placeholder="Qo'shimcha izoh..."
              className="w-full text-sm border-gray-200 rounded-md focus:border-gray-950 focus:ring-gray-950 resize-none"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}