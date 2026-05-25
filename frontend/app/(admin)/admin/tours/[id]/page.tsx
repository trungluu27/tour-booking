"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  Download,
  Filter,
  ListChecks,
  Pencil,
  Plus,
  Route,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { Badge, Button, Card, EmptyState, PageHeader, Select } from "@/components/UI";
import { api, extractErrorMessage, getAuthToken } from "@/lib/api";
import { Booking, RouteItem, Tour, Vehicle } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import RouteEditor from "@/components/RouteEditor";

type Tab = "routes" | "bookings";

export default function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tour, setTour] = useState<Tour | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("routes");
  const [editingRoute, setEditingRoute] = useState<RouteItem | "new" | null>(null);
  const [filterRouteId, setFilterRouteId] = useState<string>("");
  const [filterVehicleId, setFilterVehicleId] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [tourRes, vehiclesRes] = await Promise.all([
        api.get<Tour>(`/tours/${id}`),
        api.get<Vehicle[]>(`/vehicles`),
      ]);
      setTour(tourRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterRouteId) params.routeId = filterRouteId;
      if (filterVehicleId) params.vehicleId = filterVehicleId;
      const { data } = await api.get<Booking[]>(`/tours/${id}/bookings`, { params });
      setBookings(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    refreshBookings();
  }, [id, filterRouteId, filterVehicleId]);

  const vehicleOptionsInTour = useMemo(() => {
    if (!tour) return [] as Vehicle[];
    const used = new Set<string>();
    for (const route of tour.routes) {
      for (const slot of route.vehicleSlots) {
        if (slot.vehicle) used.add(String(slot.vehicle));
      }
    }
    return vehicles.filter((v) => used.has(v._id));
  }, [tour, vehicles]);

  const onExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterRouteId) params.set("routeId", filterRouteId);
      if (filterVehicleId) params.set("vehicleId", filterVehicleId);
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const url = `${base}/tours/${id}/bookings/export${params.toString() ? `?${params.toString()}` : ""}`;
      const token = getAuthToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Không thể xuất file");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const filename = match?.[1] ?? `bookings_${id}.xlsx`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast.success("Đã tải file Excel");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilterRouteId("");
    setFilterVehicleId("");
  };

  const onDeleteRoute = async (route: RouteItem) => {
    if (!confirm(`Xoá tuyến "${route.name}"? Mọi booking thuộc tuyến này cũng bị xoá.`)) return;
    try {
      await api.delete(`/tours/${id}/routes/${route._id}`);
      toast.success("Đã xoá tuyến");
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onDeleteBooking = async (b: Booking) => {
    if (!confirm(`Xoá booking của ${b.fullName}?`)) return;
    try {
      await api.delete(`/bookings/${b._id}`);
      toast.success("Đã xoá booking");
      await Promise.all([refresh(), refreshBookings()]);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Đang tải…</p>;
  if (!tour) return <p className="text-sm text-red-600">Không tìm thấy tour</p>;

  return (
    <>
      <Link
        href="/admin/tours"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-900 transition-colors duration-200 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Quay lại danh sách
      </Link>

      <PageHeader
        title={tour.title}
        description={tour.description}
        action={
          <Link href={`/admin/tours/${id}/edit`} className="btn-ghost">
            <Pencil className="h-4 w-4" aria-hidden />
            Sửa thông tin
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tour.status === "closed" && <Badge tone="red">Đã đóng</Badge>}
        {tour.locked && <Badge tone="orange">Form đã khoá</Badge>}
        {tour.status === "active" && !tour.locked && (
          <Badge tone="green">Đang nhận đăng ký</Badge>
        )}
        <Badge tone="slate">Slug: {tour.slug}</Badge>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("routes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer ${
            tab === "routes"
              ? "border-b-2 border-primary-900 text-primary-900"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Route className="h-4 w-4" aria-hidden />
          Tuyến ({tour.routes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer ${
            tab === "bookings"
              ? "border-b-2 border-primary-900 text-primary-900"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" aria-hidden />
          Bookings ({bookings.length})
        </button>
      </div>

      {tab === "routes" && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setEditingRoute("new")}
              icon={<Plus className="h-4 w-4" aria-hidden />}
            >
              Thêm tuyến
            </Button>
          </div>
          {tour.routes.length === 0 ? (
            <EmptyState
              title="Chưa có tuyến nào"
              description="Thêm tuyến đầu tiên và gán xe để khách có thể đăng ký."
            />
          ) : (
            <div className="grid gap-4">
              {tour.routes.map((route) => (
                <Card key={route._id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {route.name}
                      </h3>
                      {route.description && (
                        <p className="mt-1 text-sm text-slate-600">{route.description}</p>
                      )}
                      {route.departureTime && (
                        <p className="mt-1 text-xs text-slate-500">
                          Khởi hành: {formatDateTime(route.departureTime)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRoute(route)}
                        className="btn-ghost"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRoute(route)}
                        className="btn-danger"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {route.vehicleSlots.length === 0 && (
                      <p className="col-span-full rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                        Chưa gán xe cho tuyến này
                      </p>
                    )}
                    {route.vehicleSlots.map((slot) => {
                      const full = slot.booked >= slot.capacity;
                      return (
                        <div
                          key={slot._id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {slot.vehicleInfo?.licensePlate ?? "Xe đã xoá"}
                              {slot.vehicleInfo?.type && (
                                <span className="ml-2 text-xs font-normal text-slate-500">
                                  ({slot.vehicleInfo.type} chỗ)
                                </span>
                              )}
                            </p>
                            {slot.vehicleInfo && (
                              <p className="text-xs text-slate-500">
                                {slot.vehicleInfo.driverName} · {slot.vehicleInfo.driverPhone}
                              </p>
                            )}
                          </div>
                          <Badge tone={full ? "red" : "blue"}>
                            {slot.booked}/{slot.capacity}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {editingRoute && (
            <RouteEditor
              tourId={id}
              vehicles={vehicles}
              route={editingRoute === "new" ? undefined : editingRoute}
              onClose={() => setEditingRoute(null)}
              onSaved={() => {
                setEditingRoute(null);
                refresh();
              }}
            />
          )}
        </div>
      )}

      {tab === "bookings" && (
        <>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Filter className="h-4 w-4" aria-hidden />
                  Lọc:
                </div>
                <div className="flex-1">
                  <Select
                    label="Tuyến"
                    value={filterRouteId}
                    onChange={(e) => setFilterRouteId(e.target.value)}
                  >
                    <option value="">Tất cả tuyến</option>
                    {tour.routes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    label="Xe"
                    value={filterVehicleId}
                    onChange={(e) => setFilterVehicleId(e.target.value)}
                  >
                    <option value="">Tất cả xe</option>
                    {vehicleOptionsInTour.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.licensePlate} ({v.type} chỗ)
                      </option>
                    ))}
                  </Select>
                </div>
                {(filterRouteId || filterVehicleId) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 self-stretch rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 cursor-pointer sm:self-end sm:py-2.5"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Xoá lọc
                  </button>
                )}
              </div>
              <Button
                onClick={onExport}
                loading={exporting}
                icon={<Download className="h-4 w-4" aria-hidden />}
                disabled={bookings.length === 0}
              >
                Xuất Excel
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Hiển thị {bookings.length} booking
              {filterRouteId || filterVehicleId ? " (đã lọc)" : ""}.
            </p>
          </Card>

          <Card className="overflow-hidden p-0">
            {bookings.length === 0 ? (
              <div className="p-10 text-center">
                <ListChecks className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
                <p className="mt-3 text-sm text-slate-600">
                  {filterRouteId || filterVehicleId
                    ? "Không có booking phù hợp với bộ lọc"
                    : "Chưa có khách đăng ký"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Thời gian</th>
                      <th className="px-4 py-3">Khách</th>
                      <th className="px-4 py-3">Liên hệ</th>
                      <th className="px-4 py-3">Tuyến</th>
                      <th className="px-4 py-3">Xe</th>
                      <th className="px-4 py-3">Ghi chú</th>
                      <th className="px-4 py-3 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="transition-colors duration-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">
                          {formatDateTime(b.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{b.fullName}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <div>{b.phone}</div>
                          {b.email && <div className="text-xs text-slate-500">{b.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{b.routeName}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {b.vehiclePlate}
                          <span className="ml-1 text-xs text-slate-500">({b.vehicleType} chỗ)</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{b.note || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onDeleteBooking(b)}
                            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100 cursor-pointer"
                            aria-label="Xoá booking"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
