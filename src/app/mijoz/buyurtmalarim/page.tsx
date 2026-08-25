"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { MyBooking } from "@/types";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Kutilmoqda",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  CONFIRMED: {
    label: "Tasdiqlangan",
    className: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  DONE: {
    label: "Tugallangan",
    className: "bg-green-50 text-green-700 border border-green-100",
  },
  CANCELLED: {
    label: "Bekor qilingan",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
};

function getBookingServiceName(b: MyBooking): string {
  if (b.service?.name) return b.service.name;
  if (b.serviceName) return b.serviceName;
  return "Noma'lum xizmat";
}

export default function BuyurtmalarimPage() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ navbatlar: MyBooking[] }>("/my-bookings")
      .then((res) => setBookings(res.navbatlar || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Buyurtmalarim</h1>
        <p className="text-sm text-gray-500 mt-1">Sizning barcha buyurtmalaringiz</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-gray-500 mb-4">Sizda hozircha buyurtmalar mavjud emas</p>
          <a href="/mijoz" className="inline-block px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            Salonlarni ko&apos;rish
          </a>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Salon</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Xizmat</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Sana</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Narx</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Holat</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const status = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.salonName}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{getBookingServiceName(b)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {new Date(b.date).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                        {b.price.toLocaleString("uz-UZ")} so&apos;m
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {bookings.map((b) => {
              const status = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
              return (
                <div key={b.id} className="bg-white border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{b.salonName}</p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{getBookingServiceName(b)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500">
                      {new Date(b.date).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm font-medium text-gray-900">{b.price.toLocaleString("uz-UZ")} so&apos;m</p>
                  </div>
                  {b.notes && <p className="text-xs text-gray-400 mt-2">{b.notes}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
