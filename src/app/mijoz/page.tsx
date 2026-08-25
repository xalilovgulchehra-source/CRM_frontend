"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SalonBrief } from "@/types";

export default function MijozSalonsPage() {
  const [salons, setSalons] = useState<SalonBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ salonlar: SalonBrief[] }>("/salons")
      .then((res) => setSalons(res.salonlar || []))
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

  if (salons.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-gray-500">Hozircha salonlar mavjud emas</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Salonlar</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="bg-white border border-gray-100 rounded-lg p-5 flex flex-col justify-between"
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">{salon.salonName}</h2>
              <p className="text-sm text-gray-500 mt-1">{salon.ownerName}</p>
              <p className="text-sm text-gray-400 mt-0.5">{salon.phone}</p>
            </div>
            <Link
              href={`/mijoz/salon/${salon.id}`}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Xizmatlarni ko&apos;rish &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
