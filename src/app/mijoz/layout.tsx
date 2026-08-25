"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ChatModal } from "@/components/ChatModal";
import { getAllUnreadForCustomer } from "@/lib/chat-store";
import type { MyBooking } from "@/types";

const nav = [
  { href: "/mijoz", label: "Salonlar", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
  { href: "/mijoz/buyurtmalarim", label: "Buyurtmalarim", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/mijoz/hisobim", label: "Hisobim", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

function Icon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

interface SalonLink {
  salonId: number;
  clientId: number;
  salonName: string;
}

function MijozShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salonLinks, setSalonLinks] = useState<SalonLink[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSalon, setActiveSalon] = useState<SalonLink | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!loading && user && user.role === "OWNER") {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [loading, user, router, pathname]);

  useEffect(() => {
    if (!user) return;
    api.get<{ navbatlar: MyBooking[] }>("/my-bookings").then((res) => {
      const links: SalonLink[] = [];
      const seen = new Set<string>();
      for (const b of res.navbatlar || []) {
        const key = `${b.salonId}_${user.id}`;
        if (!seen.has(key) && b.salonId) {
          seen.add(key);
          links.push({ salonId: b.salonId, clientId: user.id, salonName: b.salonName || "Salon" });
        }
      }
      setSalonLinks(links);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    const check = () => {
      const unread = getAllUnreadForCustomer();
      setTotalUnread(unread.reduce((s, u) => s + u.count, 0));
    };
    check();
    const handler = () => { check(); setTick((t) => t + 1); };
    window.addEventListener("chat-new-message", handler);
    const interval = setInterval(check, 3000);
    return () => { window.removeEventListener("chat-new-message", handler); clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-sm text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user) return null;

  function openChatFor(s: SalonLink) {
    setActiveSalon(s);
    setChatOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {activeSalon && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          salonId={activeSalon.salonId}
          clientId={activeSalon.clientId}
          clientName={activeSalon.salonName}
          role="customer"
          title={activeSalon.salonName}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            Sartaroshxona CRM
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Mijoz paneli</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active =
              item.href === "/mijoz"
                ? pathname === "/mijoz"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon path={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 mb-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || user.ownerName || "Mijoz"}
              </p>
              {salonLinks.length > 0 && (
                <button
                  onClick={() => openChatFor(salonLinks[0])}
                  className="relative shrink-0 p-1 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                  title="Chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75L3.75 20.105z" />
                  </svg>
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-gray-900">Sartaroshxona CRM</h1>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function MijozLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MijozShell>{children}</MijozShell>
    </AuthProvider>
  );
}
