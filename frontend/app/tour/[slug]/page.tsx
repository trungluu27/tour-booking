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
  CheckCircle2,
  Lock,
  MapPin,
  Phone,
  Send,
  User,
  XCircle,
} from "lucide-react";

import { Badge, Button, Input, Select, Textarea } from "@/components/UI";
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
        <p className="text-sm text-primary-900">Đang tải tour…</p>
      </main>
    );
  }

  if (state.status === "not_found") {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-red-500" aria-hidden />}
        title="Tour không tồn tại"
        description="Link bạn truy cập không hợp lệ hoặc tour đã bị xoá."
        tone="red"
      />
    );
  }
  if (state.status === "closed") {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-red-500" aria-hidden />}
        title="Tour đã đóng"
        description={state.message ?? "Tour này không còn nhận đăng ký."}
        tone="red"
      />
    );
  }
  if (state.status === "locked" && state.tour) {
    return (
      <StatusScreen
        icon={<Lock className="h-12 w-12 text-accent-500" aria-hidden />}
        title="Đã đủ số lượng"
        description={state.message ?? "Form đăng ký đã được khoá."}
        tone="orange"
        tour={state.tour}
      />
    );
  }

  const tour = state.tour!;
  const bgUrl = resolveAssetUrl(tour.backgroundImage);

  return (
    <main className="min-h-screen bg-primary-50">
      <section className="relative isolate min-h-[60vh] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 via-primary-900/40 to-primary-900/80" />
        </div>

        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-32 sm:px-8">
          <Badge tone="orange">Đăng ký tour</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {tour.title}
          </h1>
          {tour.description && (
            <p className="mt-3 max-w-2xl text-base text-white/90">
              {tour.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-6xl px-4 pb-16 sm:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Form đăng ký
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Chọn tuyến và xe phù hợp, sau đó điền thông tin của bạn.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Select
              label="Tuyến"
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

            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <Input
              label="Số điện thoại"
              placeholder="09xx xxx xxx"
              inputMode="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Email (không bắt buộc)"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="lg:col-span-1" />
            <Textarea
              label="Ghi chú"
              rows={4}
              className="lg:col-span-2"
              placeholder="Yêu cầu thêm cho tour…"
              {...register("note")}
            />

            <div className="lg:col-span-2 mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Khi đăng ký, bạn đồng ý được liên hệ qua SĐT ở trên.
              </p>
              <Button
                type="submit"
                variant="accent"
                loading={isSubmitting}
                icon={<Send className="h-4 w-4" aria-hidden />}
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
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-900">
        {icon}
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusScreen({
  icon,
  title,
  description,
  tone,
  tour,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "red" | "orange";
  tour?: Tour;
}) {
  const bgUrl = resolveAssetUrl(tour?.backgroundImage);
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-primary-50 px-4 py-16">
      {bgUrl ? (
        <div className="absolute inset-0 -z-10">
          <Image src={bgUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-primary-900/70" />
        </div>
      ) : (
        <div className="aurora-bg absolute inset-0 -z-10" />
      )}
      <div className="glass-card max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white">
          {icon}
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {tone === "orange" && (
          <Badge tone="orange">
            <Phone className="h-3 w-3" aria-hidden />
            Liên hệ admin để biết tour kế tiếp
          </Badge>
        )}
      </div>
    </main>
  );
}
