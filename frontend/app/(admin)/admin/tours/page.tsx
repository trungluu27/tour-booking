"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Copy,
  Link2,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  XCircle,
} from "lucide-react";

import { api, extractErrorMessage } from "@/lib/api";
import { Badge, Button, EmptyState, PageHeader } from "@/components/UI";
import { Tour } from "@/lib/types";
import { copyToClipboard, resolveAssetUrl } from "@/lib/utils";

export default function ToursListPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Tour[]>("/tours");
      setTours(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCopyLink = async (tour: Tour) => {
    const origin =
      process.env.NEXT_PUBLIC_PUBLIC_ORIGIN ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${origin}/tour/${tour.slug}`;
    try {
      await copyToClipboard(url);
      toast.success("Đã sao chép link", { description: url });
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const toggleLock = async (tour: Tour) => {
    try {
      await api.patch(`/tours/${tour._id}/lock`, { locked: !tour.locked });
      toast.success(tour.locked ? "Đã mở form đăng ký" : "Đã khoá form đăng ký");
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onClose = async (tour: Tour) => {
    if (!confirm(`Đóng tour "${tour.title}"? Tour sẽ không nhận đăng ký mới.`)) return;
    try {
      await api.patch(`/tours/${tour._id}/close`);
      toast.success("Đã đóng tour");
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onDelete = async (tour: Tour) => {
    if (
      !confirm(
        `Xoá vĩnh viễn tour "${tour.title}" cùng toàn bộ booking? Hành động không thể hoàn tác.`,
      )
    )
      return;
    try {
      await api.delete(`/tours/${tour._id}`);
      toast.success("Đã xoá tour");
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Danh sách tour"
        description="Quản lý tour, tuyến, xe và link đăng ký cho khách."
        action={
          <Link href="/admin/tours/new" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden />
            Tạo tour mới
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải…</p>
      ) : tours.length === 0 ? (
        <EmptyState
          title="Chưa có tour nào"
          description="Tạo tour đầu tiên để bắt đầu nhận đăng ký từ khách."
          action={
            <Link href="/admin/tours/new" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden />
              Tạo tour mới
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const totalCapacity = tour.routes.reduce(
              (sum, r) => sum + r.vehicleSlots.reduce((s, v) => s + v.capacity, 0),
              0,
            );
            const totalBooked = tour.routes.reduce(
              (sum, r) => sum + r.vehicleSlots.reduce((s, v) => s + v.booked, 0),
              0,
            );
            const bgUrl = resolveAssetUrl(tour.backgroundImage);

            return (
              <article
                key={tour._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] transition-colors duration-200 hover:border-primary-200"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary-100 via-primary-200 to-accent-100">
                  {bgUrl && (
                    <Image
                      src={bgUrl}
                      alt={tour.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {tour.status === "closed" && <Badge tone="red">Đã đóng</Badge>}
                    {tour.locked && <Badge tone="orange">Đã khoá</Badge>}
                    {tour.status === "active" && !tour.locked && (
                      <Badge tone="green">Đang mở</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
                      {tour.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {tour.description || "Chưa có mô tả"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                      {tour.routes.length} tuyến
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                      {totalBooked}/{totalCapacity} chỗ
                    </span>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link
                      href={`/admin/tours/${tour._id}`}
                      className="btn-ghost"
                      title="Quản lý"
                    >
                      <Settings2 className="h-4 w-4" aria-hidden />
                      Quản lý
                    </Link>
                    <Link
                      href={`/admin/tours/${tour._id}/edit`}
                      className="btn-ghost"
                      title="Sửa thông tin"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Sửa
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onCopyLink(tour)}
                      className="btn-ghost flex-1"
                      title="Sao chép link"
                    >
                      <Copy className="h-4 w-4" aria-hidden />
                      Copy link
                    </button>
                    <a
                      href={`/tour/${tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      title="Mở link"
                    >
                      <Link2 className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLock(tour)}
                      className="btn-ghost flex-1"
                    >
                      {tour.locked ? (
                        <>
                          <LockOpen className="h-4 w-4" aria-hidden />
                          Mở khoá
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" aria-hidden />
                          Khoá form
                        </>
                      )}
                    </button>
                    {tour.status !== "closed" && (
                      <button
                        type="button"
                        onClick={() => onClose(tour)}
                        className="btn-ghost"
                        title="Đóng tour"
                      >
                        <XCircle className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(tour)}
                      className="btn-danger"
                      title="Xoá vĩnh viễn"
                      aria-label="Xoá tour"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
