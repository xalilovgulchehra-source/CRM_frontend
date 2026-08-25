"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";
import type { SalonService } from "@/types";

export default function SalonServicesPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<SalonService | null>(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    api
      .get<{ xizmatlar: SalonService[] }>(`/salons/${salonId}/services`)
      .then((res) => setServices(res.xizmatlar || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, [salonId]);

  function openBooking(service: SalonService) {
    setSelectedService(service);
    setDate("");
    setNotes("");
    setBookingError("");
    setBookingSuccess(false);
    setModalOpen(true);
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !date) return;
    setBookingLoading(true);
    setBookingError("");
    try {
      await api.post(`/salons/${salonId}/bookings`, {
        serviceId: selectedService.id,
        date,
        notes: notes || undefined,
      });
      setBookingSuccess(true);
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/mijoz" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          &larr; Salonlar
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 mt-2">Xizmatlar</h1>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-500">Bu salonda hozircha xizmatlar mavjud emas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="text-sm font-medium text-gray-900">{service.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {service.durationMins} daqiqa &middot; {service.price.toLocaleString("uz-UZ")} so&apos;m
                </p>
              </div>
              <button
                onClick={() => openBooking(service)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Band qilish
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Band qilish">
        {bookingSuccess ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-900 font-medium mb-4">Buyurtma qabul qilindi!</p>
            <Link
              href="/mijoz/buyurtmalarim"
              className="text-sm text-gray-900 font-medium hover:underline"
              onClick={() => setModalOpen(false)}
            >
              Mening buyurtmalarim &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            {selectedService && (
              <p className="text-sm text-gray-500">
                {selectedService.name} &mdash; {selectedService.price.toLocaleString("uz-UZ")} so&apos;m
              </p>
            )}

            {bookingError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
                {bookingError}
              </div>
            )}

            <div>
              <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">
                Sana va vaqt
              </label>
              <input
                id="booking-date"
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Eslatma <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
              </label>
              <textarea
                id="booking-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors resize-none"
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {bookingLoading ? "Yuborilmoqda..." : "Tasdiqlash"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
