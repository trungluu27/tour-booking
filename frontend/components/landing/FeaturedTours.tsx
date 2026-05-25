import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { PublicTourSummary } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/utils";

function formatVnDate(input?: string | null) {
  if (!input) return null;
  const date = new Date(input);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FeaturedTours({
  tours,
}: {
  tours: PublicTourSummary[];
}) {
  return (
    <section id="tours" className="bg-white px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-900">
              <MapPin className="h-3 w-3" aria-hidden />
              Tour đang mở đăng ký
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Chuyến đi đang chờ bạn
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              Mỗi tour hiển thị rõ tuyến, xe phục vụ và số chỗ còn trống. Chọn
              chuyến phù hợp và đăng ký chỉ trong vài bước.
            </p>
          </div>
        </div>

        {tours.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <MapPin className="h-10 w-10 text-slate-400" aria-hidden />
            <p className="mt-4 text-base font-semibold text-slate-800">
              Hiện chưa có tour mở đăng ký
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              Đội ngũ chúng tôi đang cập nhật lịch trình mới. Vui lòng quay lại
              sau hoặc liên hệ hotline để được tư vấn riêng.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => {
              const bgUrl = resolveAssetUrl(tour.backgroundImage);
              const dep = formatVnDate(tour.earliestDeparture);
              const soldRatio =
                tour.totalCapacity > 0
                  ? Math.min(100, Math.round((tour.totalBooked / tour.totalCapacity) * 100))
                  : 0;
              const seatsBadge = tour.locked
                ? "Đã đủ"
                : tour.seatsLeft > 0
                  ? `Còn ${tour.seatsLeft} chỗ`
                  : "Sắp đầy";

              return (
                <Link
                  key={tour._id}
                  href={`/tour/${tour.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[var(--shadow-pop)] cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-100 via-primary-200 to-accent-100">
                    {bgUrl && (
                      <Image
                        src={bgUrl}
                        alt={tour.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <span
                      className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                        tour.locked
                          ? "bg-red-500 text-white"
                          : tour.seatsLeft <= 3
                            ? "bg-accent-500 text-white"
                            : "bg-white/95 text-primary-900"
                      }`}
                    >
                      {seatsBadge}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
                      {tour.title}
                    </h3>
                    {tour.description && (
                      <p className="line-clamp-2 text-sm text-slate-600">
                        {tour.description}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {tour.routeCount} tuyến
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                        {tour.totalCapacity} chỗ
                      </span>
                      {dep && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {dep}
                        </span>
                      )}
                    </div>

                    {tour.totalCapacity > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                          style={{ width: `${soldRatio}%` }}
                        />
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-xs font-medium text-slate-500">
                        {soldRatio}% đã đăng ký
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-900 transition-transform duration-200 group-hover:translate-x-0.5">
                        Xem chi tiết
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
