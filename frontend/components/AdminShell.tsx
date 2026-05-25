"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, LayoutDashboard, LogOut, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/tours", label: "Tour", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Pool xe", icon: Truck },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <Link
          href="/admin/tours"
          className="flex items-center gap-2 px-2 cursor-pointer"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-900 text-white">
            <Bus className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-semibold text-slate-900">
            Tour Booking
          </span>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer",
                  active
                    ? "bg-primary-50 text-primary-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Đăng xuất
        </button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/admin/tours" className="flex items-center gap-2 cursor-pointer">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-900 text-white">
            <Bus className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            Tour Booking
          </span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-2 text-slate-600 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
          aria-label="Đăng xuất"
        >
          <LogOut className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <nav className="grid grid-cols-2 border-b border-slate-200 bg-white lg:hidden">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer",
                active
                  ? "border-b-2 border-primary-900 text-primary-900"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
