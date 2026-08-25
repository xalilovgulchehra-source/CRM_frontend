"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SalonBrief } from "@/types";

interface SalonWithCount extends SalonBrief {
  serviceCount: number;
}

export default function MijozSalonsPage() {
  const [salons, setSalons] = useState<SalonWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get<{ salonlar: SalonBrief[] }>("/salons")
      .then(async (res) => {
        const list = res.salonlar || [];
        const withCounts = await Promise.all(
          list.map(async (s) => {
            try {
              const r = await api.get<{ xizmatlar: { id: number }[] }>(`/salons/${s.id}/services`);
              return { ...s, serviceCount: (r.xizmatlar || []).length };
            } catch {
              return { ...s, serviceCount: 0 };
            }
          })
        );
        setSalons(withCounts.filter((s) => s.serviceCount > 0));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = salons.filter(
    (s) =>
      s.salonName.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-gray-900">Salonlar</h1>
        <p className="text-sm text-gray-500 mt-1">Sartaroshxona va salonlarni toping</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Salon qidirish..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <p className="text-sm text-gray-500">
            {search ? "Qidiruv bo'yicha hech narsa topilmadi" : "Hozircha xizmatli salonlar mavjud emas"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((salon) => (
            <div
              key={salon.id}
              className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1">{salon.salonName}</h2>
                <p className="text-sm text-gray-500">{salon.ownerName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    {salon.serviceCount} xizmat
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <p className="text-xs text-gray-400">{salon.phone}</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/mijoz/salon/${salon.id}`}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Xizmatlarni ko&apos;rish
                </Link>
                <Link
                  href={`/mijoz/salon/${salon.id}/zakaz`}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Zakaz berish
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
