import { PageHeader } from "@/components/UI";
import TourForm from "@/components/TourForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewTourPage() {
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
        title="Tạo tour mới"
        description="Sau khi tạo, bạn có thể thêm tuyến và xe trong trang quản lý chi tiết."
      />
      <TourForm mode="create" />
    </>
  );
}
