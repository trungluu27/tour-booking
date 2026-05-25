import { Headphones, Leaf, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { BENEFITS } from "@/lib/landing-content";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  headphones: Headphones,
  wallet: Wallet,
  leaf: Leaf,
};

export default function Benefits() {
  return (
    <section className="bg-white px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-900">
              Vì sao chọn chúng tôi
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Trải nghiệm đặt tour{" "}
              <span className="text-accent-500">không lo lắng</span>
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Chúng tôi cam kết minh bạch về xe, lộ trình và chỗ ngồi để bạn yên
              tâm tận hưởng chuyến đi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => {
              const Icon = ICON_MAP[benefit.icon] ?? ShieldCheck;
              return (
                <div
                  key={benefit.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 hover:border-primary-200 hover:bg-primary-50/40"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 text-primary-900 transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
