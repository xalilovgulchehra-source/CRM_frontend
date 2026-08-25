"use client";

import { useAuth } from "@/lib/auth-context";

export default function HisobimPage() {
  const { user } = useAuth();

  if (!user) return null;

  const infoItems = [
    {
      label: "Ism",
      value: user.fullName || user.ownerName || "Ko'rsatilmagan",
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    },
    {
      label: "Email",
      value: user.email,
      icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    },
    {
      label: "Telefon",
      value: user.phone,
      icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
    },
    {
      label: "Ro'yxatdan o'tgan",
      value: new Date(user.createdAt).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Hisobim</h1>
        <p className="text-sm text-gray-500 mt-1">Shaxsiy ma&apos;lumotlaringiz</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600">
                {(user.fullName || user.ownerName || "M").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                {user.fullName || user.ownerName || "Mijoz"}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {infoItems.map((item) => (
            <div key={item.label} className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-100 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Hisob turi</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium text-gray-700">Mijoz</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Siz mijoz sifatida ro&apos;yxatdan o&apos;tgansiz. Salon xizmatlaridan foydalanishingiz va zakaz berishingiz mumkin.
        </p>
      </div>
    </div>
  );
}
