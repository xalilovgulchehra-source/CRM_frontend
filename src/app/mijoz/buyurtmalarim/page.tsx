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

export default function BuyurtmalarimPage() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<MyBooking[]>("/my-bookings")
      .then(setBookings)
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

  if (bookings.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Mening buyurtmalarim</h1>
        <div className="text-center py-20">
          <p className="text-sm text-gray-500">Sizda hozircha buyurtmalar mavjud emas</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Mening buyurtmalarim</h1>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Salon
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Xizmat
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Sana
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Narx
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                  Holat
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const status = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
                return (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-900">{b.salonName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{b.serviceName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(b.date).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">
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

        <div className="md:hidden divide-y divide-gray-100">
          {bookings.map((b) => {
            const status = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
            return (
              <div key={b.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{b.salonName}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{b.serviceName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(b.date).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-700">{b.price.toLocaleString("uz-UZ")} so&apos;m</p>
                {b.notes && <p className="text-xs text-gray-400">{b.notes}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
