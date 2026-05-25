import Link from "next/link";
import { Bus, Phone } from "lucide-react";
import { BRAND } from "@/lib/landing-content";

export default function Navbar() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20 px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-md sm:px-5">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-900 to-primary-600 text-white">
            <Bus className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 sm:text-base">
              {BRAND.name}
            </span>
            <span className="hidden text-[10px] uppercase tracking-wider text-slate-500 sm:block">
              {BRAND.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a
            href="#tours"
            className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
          >
            Tour nổi bật
          </a>
          <a
            href="#uu-dai"
            className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
          >
            Ưu đãi
          </a>
          <a
            href="#danh-gia"
            className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
          >
            Đánh giá
          </a>
        </nav>

        <a
          href={`tel:${BRAND.hotline.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-3 py-2 text-xs font-semibold text-white shadow-[var(--shadow-soft)] transition-colors duration-200 hover:bg-accent-600 cursor-pointer sm:px-4 sm:text-sm"
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Hotline</span>
          <span>{BRAND.hotline}</span>
        </a>
      </div>
    </header>
  );
}
