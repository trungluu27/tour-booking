"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Bus,
  CalendarClock,
  ChevronDown,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { Button, Input, Select, Textarea } from "@/components/UI";
import { api, extractErrorMessage } from "@/lib/api";
import { Tour } from "@/lib/types";
import { formatDateTime, resolveAssetUrl } from "@/lib/utils";

const schema = z.object({
  routeId: z.string().min(1, "Chọn tuyến"),
  vehicleSlotId: z.string().min(1, "Chọn xe"),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^[0-9+()\-\s]{6,20}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface PageState {
  status: "loading" | "ready" | "locked" | "closed" | "not_found";
  tour: Tour | null;
  message?: string;
}

export default function PublicTourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading", tour: null });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      routeId: "",
      vehicleSlotId: "",
      fullName: "",
      phone: "",
      email: "",
      note: "",
    },
  });

  const watchRoute = watch("routeId");
  const watchSlot = watch("vehicleSlotId");

  useEffect(() => {
    api
      .get<Tour>(`/tours/slug/${slug}`)
      .then(({ data }) => {
        if (data.locked) {
          setState({
            status: "locked",
            tour: data,
            message: "Form đăng ký đã được khoá vì đã đủ số lượng.",
          });
          return;
        }
        setState({ status: "ready", tour: data });
        if (data.routes.length === 1) {
          setValue("routeId", data.routes[0]._id);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) {
          setState({ status: "not_found", tour: null });
        } else if (status === 403) {
          setState({
            status: "closed",
            tour: null,
            message: "Tour đã đóng đăng ký.",
          });
        } else {
          toast.error(extractErrorMessage(err));
          setState({ status: "not_found", tour: null });
        }
      });
  }, [slug, setValue]);

  const selectedRoute = useMemo(
    () => state.tour?.routes.find((r) => r._id === watchRoute),
    [state.tour, watchRoute],
  );

  useEffect(() => {
    if (selectedRoute && watchSlot) {
      const stillExists = selectedRoute.vehicleSlots.find((s) => s._id === watchSlot);
      if (!stillExists) setValue("vehicleSlotId", "");
    }
  }, [watchRoute, selectedRoute, watchSlot, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post(`/tours/slug/${slug}/bookings`, {
        ...values,
        email: values.email || undefined,
      });
      toast.success("Đăng ký thành công!");
      router.push(`/tour/${slug}/success`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-primary-50 px-4">
        <div className="flex items-center gap-3 text-sm text-primary-900">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          Đang tải tour…
        </div>
      </main>
    );
  }

  if (state.status === "not_found") {
    return (
      <StatusScreen
        icon={<XCircle className="h-8 w-8 text-red-500" aria-hidden />}
        iconBg="bg-red-50"
        title="Tour không tồn tại"
        description="Link bạn truy cập không hợp lệ hoặc tour đã bị xoá."
      />
    );
  }
  if (state.status === "closed") {
    return (
      <StatusScreen
        icon={<XCircle className="h-8 w-8 text-red-500" aria-hidden />}
        iconBg="bg-red-50"
        title="Tour đã đóng"
        description={state.message ?? "Tour này không còn nhận đăng ký."}
      />
    );
  }
  if (state.status === "locked" && state.tour) {
    return (
      <StatusScreen
        icon={<Lock className="h-8 w-8 text-accent-600" aria-hidden />}
        iconBg="bg-accent-50"
        title="Đã đủ số lượng"
        description={state.message ?? "Form đăng ký đã được khoá."}
        tour={state.tour}
        footer={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            Liên hệ admin để biết tour kế tiếp
          </span>
        }
      />
    );
  }

  const tour = state.tour!;
  const bgUrl = resolveAssetUrl(tour.backgroundImage);

  const earliestDeparture = tour.routes
    .map((r) => r.departureTime)
    .filter((d): d is string => Boolean(d))
    .sort()[0];

  const totalSeatsLeft = tour.routes.reduce(
    (sum, r) =>
      sum +
      r.vehicleSlots.reduce(
        (s, slot) => s + Math.max(0, slot.capacity - slot.booked),
        0,
      ),
    0,
  );

  return (
    <main className="min-h-screen bg-primary-50">
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {bgUrl ? (
            <Image
              src={bgUrl}
              alt={tour.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="aurora-bg h-full w-full" />
          )}
          {/* Cinematic gradient: light at top, deep at bottom for type legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/20 via-primary-950/45 to-primary-950/90" />
          {/* Subtle vignette to focus content */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_45%,rgba(2,6,23,0.55)_100%)]" />
        </div>

        <div className="mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-end px-4 pb-24 pt-32 sm:px-8 sm:pt-36">
          {/* Glass status chips — sit naturally on the photo */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Đang mở đăng ký
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {tour.routes.length} tuyến
            </span>
            {earliestDeparture && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                Khởi hành {formatDateTime(earliestDeparture)}
              </span>
            )}
            {totalSeatsLeft > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Bus className="h-3.5 w-3.5" aria-hidden />
                Còn {totalSeatsLeft} chỗ
              </span>
            )}
          </div>

          <h1
            className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
          >
            {tour.title}
          </h1>

          {tour.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {tour.description}
            </p>
          )}

          {/* Scroll cue toward form */}
          <a
            href="#dang-ky"
            className="group mt-10 hidden w-fit items-center gap-3 text-sm text-white/75 transition-colors hover:text-white sm:flex"
          >
            <span className="h-px w-12 bg-white/40 transition-all duration-300 group-hover:w-16 group-hover:bg-white/70" />
            Cuộn xuống để đăng ký
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
          </a>
        </div>
      </section>

      {/* ───────── FORM CARD ───────── */}
      <section
        id="dang-ky"
        className="relative mx-auto -mt-20 max-w-5xl px-4 pb-20 sm:px-8"
      >
        <div className="glass-card overflow-hidden rounded-[2rem] shadow-[var(--shadow-pop)]">
          {/* Card header */}
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-primary-50/80 via-white to-white px-6 py-5 sm:px-10 sm:py-7">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-900 text-white shadow-[var(--shadow-soft)]">
                <Send className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">
                  Đăng ký tham gia tour
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Chọn tuyến &amp; xe phù hợp, sau đó điền thông tin liên hệ.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-8 px-6 py-7 sm:px-10 sm:py-9"
          >
            {/* Section 1: Trip details */}
            <div className="grid gap-4">
              <SectionHeader index={1} title="Chuyến đi" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Tuyến"
                  leftIcon={<MapPin />}
                  error={errors.routeId?.message}
                  {...register("routeId")}
                >
                  <option value="">— Chọn tuyến —</option>
                  {tour.routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                      {r.departureTime ? ` · ${formatDateTime(r.departureTime)}` : ""}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Xe"
                  leftIcon={<Bus />}
                  error={errors.vehicleSlotId?.message}
                  disabled={!selectedRoute}
                  {...register("vehicleSlotId")}
                >
                  <option value="">
                    {selectedRoute ? "— Chọn xe —" : "Chọn tuyến trước"}
                  </option>
                  {selectedRoute?.vehicleSlots.map((slot) => {
                    const remain = slot.capacity - slot.booked;
                    const full = remain <= 0;
                    const label = slot.vehicleInfo
                      ? `${slot.vehicleInfo.licensePlate} (${slot.vehicleInfo.type} chỗ)`
                      : "Xe";
                    return (
                      <option key={slot._id} value={slot._id} disabled={full}>
                        {label} — {full ? "đã hết chỗ" : `còn ${remain}/${slot.capacity} chỗ`}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            {/* Section 2: Contact info */}
            <div className="grid gap-4">
              <SectionHeader index={2} title="Thông tin liên hệ" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  leftIcon={<User />}
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <Input
                  label="Số điện thoại"
                  placeholder="09xx xxx xxx"
                  inputMode="tel"
                  leftIcon={<Phone />}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <Input
                  label="Email (không bắt buộc)"
                  type="email"
                  placeholder="email@example.com"
                  leftIcon={<Mail />}
                  error={errors.email?.message}
                  className="sm:col-span-2"
                  {...register("email")}
                />
                <Textarea
                  label="Ghi chú"
                  rows={3}
                  className="sm:col-span-2"
                  placeholder="Yêu cầu thêm cho tour…"
                  {...register("note")}
                />
              </div>
            </div>

            {/* Footer with CTA */}
            <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 sm:items-center">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:mt-0"
                  aria-hidden
                />
                Thông tin của bạn được bảo mật. Khi gửi đăng ký, bạn đồng ý nhận liên
                hệ qua SĐT đã cung cấp.
              </p>
              <Button
                type="submit"
                variant="accent"
                loading={isSubmitting}
                icon={<Send className="h-4 w-4" aria-hidden />}
                className="w-full sm:w-auto"
              >
                Gửi đăng ký
              </Button>
            </div>
          </form>
        </div>

        {selectedRoute && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<MapPin className="h-4 w-4" aria-hidden />}
              label="Tuyến"
              value={selectedRoute.name}
            />
            <SummaryCard
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label="Khởi hành"
              value={
                selectedRoute.departureTime
                  ? formatDateTime(selectedRoute.departureTime)
                  : "Chưa xác định"
              }
            />
            <SummaryCard
              icon={<Bus className="h-4 w-4" aria-hidden />}
              label="Số xe phục vụ"
              value={`${selectedRoute.vehicleSlots.length} xe`}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-900">
        {index}
      </span>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-900">
        {title}
      </h3>
      <span className="h-px flex-1 bg-slate-200" aria-hidden />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-900">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusScreen({
  icon,
  iconBg,
  title,
  description,
  tour,
  footer,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tour?: Tour;
  footer?: React.ReactNode;
}) {
  const bgUrl = resolveAssetUrl(tour?.backgroundImage);
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-primary-50 px-4 py-16">
      {bgUrl ? (
        <div className="absolute inset-0 -z-10">
          <Image src={bgUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/55 via-primary-950/70 to-primary-950/85" />
        </div>
      ) : (
        <div className="aurora-bg absolute inset-0 -z-10" />
      )}
      <div className="glass-card max-w-md rounded-3xl p-8 text-center shadow-[var(--shadow-pop)]">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${iconBg}`}>
          {icon}
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {footer && <div className="mt-5 flex justify-center">{footer}</div>}
      </div>
    </main>
  );
}
