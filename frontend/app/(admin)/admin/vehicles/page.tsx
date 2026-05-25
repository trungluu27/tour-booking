"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Truck, X } from "lucide-react";

import { api, extractErrorMessage } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from "@/components/UI";
import { Vehicle, VEHICLE_TYPE_LABEL, VehicleType } from "@/lib/types";

const VEHICLE_TYPES: VehicleType[] = ["4", "7", "16", "29", "45"];

const schema = z.object({
  type: z.enum(["4", "7", "16", "29", "45"]),
  licensePlate: z.string().min(1, "Bắt buộc"),
  driverName: z.string().min(1, "Bắt buộc"),
  driverPhone: z.string().min(1, "Bắt buộc"),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "16", licensePlate: "", driverName: "", driverPhone: "", note: "" },
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vehicle[]>("/vehicles");
      setVehicles(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ type: "16", licensePlate: "", driverName: "", driverPhone: "", note: "" });
    setShowForm(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    reset({
      type: v.type,
      licensePlate: v.licensePlate,
      driverName: v.driverName,
      driverPhone: v.driverPhone,
      note: v.note ?? "",
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await api.put(`/vehicles/${editing._id}`, values);
        toast.success("Đã cập nhật xe");
      } else {
        await api.post("/vehicles", values);
        toast.success("Đã thêm xe");
      }
      closeForm();
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onDelete = async (v: Vehicle) => {
    if (!confirm(`Xoá xe ${v.licensePlate}?`)) return;
    try {
      await api.delete(`/vehicles/${v._id}`);
      toast.success("Đã xoá xe");
      refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Pool xe"
        description="Tạo và quản lý danh sách xe dùng chung cho mọi tour."
        action={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" aria-hidden />}>
            Thêm xe
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải…</p>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="Chưa có xe nào"
          description="Bắt đầu bằng cách thêm xe đầu tiên vào pool dùng chung."
          action={
            <Button onClick={openCreate} icon={<Plus className="h-4 w-4" aria-hidden />}>
              Thêm xe
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">Loại xe</th>
                  <th className="px-4 py-3">Biển số</th>
                  <th className="px-4 py-3">Tài xế</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v._id} className="transition-colors duration-200 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge tone="blue">
                        <Truck className="h-3 w-3" aria-hidden />
                        {VEHICLE_TYPE_LABEL[v.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{v.licensePlate}</td>
                    <td className="px-4 py-3 text-slate-700">{v.driverName}</td>
                    <td className="px-4 py-3 text-slate-700">{v.driverPhone}</td>
                    <td className="px-4 py-3 text-slate-500">{v.note || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-900 cursor-pointer"
                          aria-label="Sửa"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(v)}
                          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100 cursor-pointer"
                          aria-label="Xoá"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Sửa xe" : "Thêm xe mới"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1 text-slate-500 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
              <Select label="Loại xe" error={errors.type?.message} {...register("type")}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
                ))}
              </Select>
              <Input
                label="Biển số xe"
                placeholder="VD: 51A-12345"
                error={errors.licensePlate?.message}
                {...register("licensePlate")}
              />
              <Input
                label="Tên tài xế"
                error={errors.driverName?.message}
                {...register("driverName")}
              />
              <Input
                label="SĐT tài xế"
                error={errors.driverPhone?.message}
                {...register("driverPhone")}
              />
              <Input
                label="Ghi chú"
                className="sm:col-span-2"
                {...register("note")}
              />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeForm}>
                  Huỷ
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {editing ? "Lưu thay đổi" : "Thêm xe"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
