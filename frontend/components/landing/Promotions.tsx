import { Gift, Sparkles } from "lucide-react";
import { PROMOTIONS } from "@/lib/landing-content";

export default function Promotions() {
  return (
    <section id="uu-dai" className="bg-primary-50 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-700">
            <Sparkles className="h-3 w-3" aria-hidden />
            Ưu đãi đang chạy
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Tiết kiệm hơn với các chương trình ưu đãi
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            Áp dụng tự động khi bạn đăng ký trên các tour phù hợp. Hãy theo dõi
            để không bỏ lỡ chuyến đi yêu thích.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PROMOTIONS.map((promo) => (
            <article
              key={promo.id}
              className="group relative overflow-hidden rounded-2xl border border-white bg-white p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-accent-100 to-primary-100 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {promo.badge}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-900">
                    <Gift className="h-5 w-5" aria-hidden />
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {promo.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {promo.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-accent-700">
                    {promo.highlight}
                  </p>
                  <p className="text-xs text-slate-500">{promo.validUntil}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
