"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SalonService, SalonBrief } from "@/types";

export default function SalonServicesPage() {
  const params = useParams();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<SalonBrief | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <Link href="/mijoz" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Salonlar
        </Link>

        {salon && (
          <div className="bg-white border border-gray-100 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">{salon.salonName}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{salon.ownerName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <p className="text-xs text-gray-400">{salon.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Xizmatlar</h2>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">Bu salonda hozircha xizmatlar mavjud emas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-100 rounded-lg p-5 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.durationMins} daqiqa
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {service.price.toLocaleString("uz-UZ")} so&apos;m
                    </span>
                  </div>
                </div>
                <Link
                  href={`/mijoz/salon/${salonId}/zakaz?service=${service.id}`}
                  className="ml-4 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shrink-0"
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
