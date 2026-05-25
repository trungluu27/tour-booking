import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { STATS } from "@/lib/landing-content";

export default function Hero() {
  return (
    <section className="aurora-bg relative overflow-hidden px-4 pb-16 pt-32 sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-primary-900 shadow-[var(--shadow-soft)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Hơn 10.000 chuyến đi đáng nhớ
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
            Khám phá{" "}
            <span className="bg-gradient-to-r from-primary-900 via-primary-600 to-accent-500 bg-clip-text text-transparent">
              Việt Nam
            </span>{" "}
            cùng những chuyến đi đáng nhớ
          </h1>

          <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Đặt tour chỉ trong 1 phút. Tự chọn tuyến đi và xe phù hợp với gia
            đình, nhóm bạn hoặc công ty của bạn.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <a href="#tours" className="btn-accent">
              <MapPin className="h-4 w-4" aria-hidden />
              Xem tour đang mở
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href="#danh-gia" className="btn-ghost">
              <Star className="h-4 w-4 text-accent-500" aria-hidden />
              Đọc đánh giá khách hàng
            </a>
          </div>

          <div className="mt-12 grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-left shadow-[var(--shadow-soft)] backdrop-blur-md"
              >
                <p className="text-2xl font-bold text-primary-900 sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
