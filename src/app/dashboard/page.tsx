"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardStats, Booking } from "@/types";
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
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>("/dashboard/stats").catch(() => null),
      api
        .get<{ navbatlar: Booking[]; soni: number }>("/bookings?limit=10&sort=date")
        .catch(() => ({ navbatlar: [], soni: 0 })),
    ])
      .then(([s, b]) => {
        setStats(s);
        setBookings(b.navbatlar);
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }
  const statCards = [
    { label: "Jami mijozlar", value: stats?.totalClients ?? 0 },
    { label: "Xizmatlar", value: stats?.totalServices ?? 0 },
    { label: "Jami navbatlar", value: stats?.totalBookings ?? 0 },
    { label: "Bugun", value: stats?.todayBookings ?? 0 },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Umumiy ko&apos;rinish</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-lg p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Navbatlar</h2>
        </div>
        {bookings.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            Navbatlar yo&apos;q
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.map((b) => {
              const statusKey = (b.status || "").toLowerCase();
              return (
                <div
                  key={b.id}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.client?.fullName || b.clientId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.service?.name || b.serviceId} &middot;{" "}
                      {new Date(b.date).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColors[statusKey] || ""}`}
                  >
                    {statusLabels[statusKey] || b.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}