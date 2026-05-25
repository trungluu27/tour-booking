import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/landing-content";

export default function Testimonials() {
  return (
    <section id="danh-gia" className="bg-primary-50 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-900 shadow-sm">
            <Star className="h-3 w-3 fill-accent-500 text-accent-500" aria-hidden />
            Trung bình 4.9/5 từ hơn 2.000 đánh giá
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            Những chia sẻ thật từ người đã đi cùng chúng tôi.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className="relative rounded-2xl border border-white bg-white p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
            >
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-primary-100"
                aria-hidden
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent-500 text-accent-500"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                "{t.content}"
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${t.color} text-sm font-semibold text-white`}
                  aria-hidden
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
