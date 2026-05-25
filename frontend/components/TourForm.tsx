"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, Save } from "lucide-react";

import { Button, Card, Input, Textarea } from "@/components/UI";
import { api, extractErrorMessage } from "@/lib/api";
import { Tour } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Bắt buộc"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  tour?: Tour;
  mode: "create" | "edit";
}

export default function TourForm({ tour, mode }: Props) {
  const router = useRouter();
  const [imagePath, setImagePath] = useState<string | undefined>(
    tour?.backgroundImage,
  );
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: tour?.title ?? "",
      description: tour?.description ?? "",
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImagePath(data.path);
      toast.success("Đã tải ảnh");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values, backgroundImage: imagePath };
      if (mode === "create") {
        const { data } = await api.post<Tour>("/tours", payload);
        toast.success("Đã tạo tour");
        router.push(`/admin/tours/${data._id}`);
      } else if (tour) {
        await api.put(`/tours/${tour._id}`, payload);
        toast.success("Đã cập nhật");
        router.push(`/admin/tours/${tour._id}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const previewUrl = resolveAssetUrl(imagePath);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex flex-col gap-4">
          <Input
            label="Tiêu đề tour"
            placeholder="VD: Tour Đà Lạt 3 ngày 2 đêm"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label="Mô tả"
            placeholder="Mô tả chi tiết hiển thị ở trang đăng ký…"
            rows={6}
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<Save className="h-4 w-4" aria-hidden />}
            >
              {mode === "create" ? "Tạo tour" : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-900">Ảnh background</h3>
        <p className="mt-1 text-xs text-slate-500">
          Ảnh hiển thị ở trang đăng ký công khai. Khuyến nghị 1920×1080.
        </p>
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-primary-100 to-accent-100">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Background"
              width={640}
              height={360}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-primary-900/70">
              Chưa có ảnh
            </div>
          )}
        </div>
        <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-primary-300 hover:bg-primary-50">
          <ImagePlus className="h-4 w-4" aria-hidden />
          {uploading ? "Đang tải…" : "Tải ảnh lên"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </Card>
    </form>
  );
}
