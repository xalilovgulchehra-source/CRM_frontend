"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SalonService, SalonBrief } from "@/types";

export default function ZakazPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: salonId } = use(params);
  const router = useRouter();

  const [salon, setSalon] = useState<SalonBrief | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedService, setSelectedService] = useState<SalonService | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ salonlar: SalonBrief[] }>("/salons").catch(() => ({ salonlar: [] as SalonBrief[] })),
      api.get<{ xizmatlar: SalonService[] }>(`/salons/${salonId}/services`).catch(() => ({ xizmatlar: [] as SalonService[] })),
    ])
      .then(([salonsRes, servicesRes]) => {
        const found = salonsRes.salonlar.find((s) => s.id === Number(salonId));
        setSalon(found || null);
        setServices(servicesRes.xizmatlar || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, [salonId]);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  function selectService(service: SalonService) {
    setSelectedService(service);
    setServiceSearch(service.name);
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !date) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post(`/salons/${salonId}/bookings`, {
        serviceId: selectedService.id,
        date,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
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

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Buyurtma qabul qilindi!</h1>
        <p className="text-sm text-gray-500 mb-8">
          {salon?.salonName} saloniga buyurtma muvaffaqiyatli yuborildi. Salon egasi siz bilan bog&apos;lanadi.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/mijoz/buyurtmalarim"
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Buyurtmalarim
          </Link>
          <Link
            href="/mijoz"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Salonlar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href={`/mijoz/salon/${salonId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {salon?.salonName || "Salon"}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Zakaz berish</h1>
        {salon && (
          <p className="text-sm text-gray-500 mt-1">{salon.salonName} — {salon.ownerName}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md border border-red-100">
            {submitError}
          </div>
        )}

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Xizmatni tanlang</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => {
                setServiceSearch(e.target.value);
                setSelectedService(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Xizmat nomini kiriting..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>
          {showDropdown && serviceSearch && filteredServices.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onMouseDown={() => selectService(service)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    selectedService?.id === service.id ? "bg-gray-50 font-medium" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{service.name}</span>
                    <span className="text-gray-500 text-xs">{service.durationMins} daq &middot; {service.price.toLocaleString("uz-UZ")} so&apos;m</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedService && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tanlangan xizmat</span>
              <span className="text-sm font-medium text-gray-900">{selectedService.name}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">Davomiyligi</span>
              <span className="text-sm font-medium text-gray-900">{selectedService.durationMins} daqiqa</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Jami</span>
              <span className="text-base font-semibold text-gray-900">{selectedService.price.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
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
            placeholder="Qo'shimcha ma'lumotlar..."
          />
        </div>

        <button
          type="submit"
          disabled={!selectedService || !date || submitting}
          className="w-full py-3 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Yuborilmoqda..." : "Zakaz berish"}
        </button>
      </form>
    </div>
  );
}
