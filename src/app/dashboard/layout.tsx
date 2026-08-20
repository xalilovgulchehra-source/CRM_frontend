"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-sm text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
