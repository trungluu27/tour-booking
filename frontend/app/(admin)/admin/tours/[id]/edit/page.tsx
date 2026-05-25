"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/UI";
import TourForm from "@/components/TourForm";
import { api, extractErrorMessage } from "@/lib/api";
import { Tour } from "@/lib/types";

export default function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Tour>(`/tours/${id}`)
      .then(({ data }) => setTour(data))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-slate-500">Đang tải…</p>;
  if (!tour) return <p className="text-sm text-red-600">Không tìm thấy tour</p>;

  return (
    <>
      <Link
        href={`/admin/tours/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-primary-900 transition-colors duration-200 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Quay lại quản lý tour
      </Link>
      <PageHeader
        title={`Sửa: ${tour.title}`}
        description="Cập nhật thông tin chung của tour."
      />
      <TourForm mode="edit" tour={tour} />
    </>
  );
}
