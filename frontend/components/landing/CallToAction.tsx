import { ArrowRight, Phone } from "lucide-react";
import { BRAND } from "@/lib/landing-content";

export default function CallToAction() {
  return (
    <section className="px-4 py-20 sm:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-700 to-accent-500 p-10 text-white shadow-[var(--shadow-pop)] sm:p-14">
        <div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-300/30 blur-3xl"
          aria-hidden
        />

        <div className="relative grid items-center gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              Đặt tour ngay hôm nay, hoặc gọi cho chúng tôi để được tư vấn miễn
              phí về tuyến đi phù hợp với bạn.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href="#tours"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-900 shadow-sm transition-colors duration-200 hover:bg-primary-50 cursor-pointer"
            >
              Xem tour đang mở
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={`tel:${BRAND.hotline.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20 cursor-pointer"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Gọi {BRAND.hotline}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
