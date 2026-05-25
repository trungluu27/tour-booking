"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2, X } from "lucide-react";

import { Button, Input, Select, Textarea } from "@/components/UI";
import { api, extractErrorMessage } from "@/lib/api";
import { RouteItem, Vehicle, VEHICLE_CAPACITY, VEHICLE_TYPE_LABEL } from "@/lib/types";

interface SlotInput {
  _id?: string;
  vehicle: string;
  capacity: number;
}

interface Props {
  tourId: string;
  vehicles: Vehicle[];
  route?: RouteItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function RouteEditor({ tourId, vehicles, route, onClose, onSaved }: Props) {
  const [name, setName] = useState(route?.name ?? "");
  const [description, setDescription] = useState(route?.description ?? "");
  const [departureTime, setDepartureTime] = useState(
    route?.departureTime ? route.departureTime.slice(0, 16) : "",
  );
  const [slots, setSlots] = useState<SlotInput[]>(
    route?.vehicleSlots.map((s) => ({
      _id: s._id,
      vehicle: s.vehicle,
      capacity: s.capacity,
    })) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const addSlot = () => {
    if (vehicles.length === 0) {
      toast.error("Vui lòng tạo xe trong Pool xe trước");
      return;
    }
    const used = new Set(slots.map((s) => s.vehicle));
    const next = vehicles.find((v) => !used.has(v._id));
    if (!next) {
      toast.info("Đã gán tất cả xe trong pool cho tuyến này");
      return;
    }
    setSlots((prev) => [
      ...prev,
      { vehicle: next._id, capacity: VEHICLE_CAPACITY[next.type] },
    ]);
  };

  const updateSlot = (idx: number, patch: Partial<SlotInput>) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      if (patch.vehicle) {
        const v = vehicles.find((x) => x._id === patch.vehicle);
        if (v) {
          copy[idx].capacity = Math.min(copy[idx].capacity || VEHICLE_CAPACITY[v.type], VEHICLE_CAPACITY[v.type]);
        }
      }
      return copy;
    });
  };

  const removeSlot = (idx: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      setErrors({ name: "Bắt buộc" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        departureTime: departureTime ? new Date(departureTime).toISOString() : undefined,
        vehicleSlots: slots,
      };
      if (route) {
        await api.put(`/tours/${tourId}/routes/${route._id}`, payload);
        toast.success("Đã cập nhật tuyến");
      } else {
        await api.post(`/tours/${tourId}/routes`, payload);
        toast.success("Đã tạo tuyến");
      }
      onSaved();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {route ? "Sửa tuyến" : "Tạo tuyến mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition-colors duration-200 hover:bg-slate-100 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <Input
            label="Tên tuyến"
            placeholder="VD: TP.HCM - Đà Lạt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Textarea
            label="Mô tả tuyến"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Thời gian khởi hành"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Xe trong tuyến</h3>
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-900 transition-colors duration-200 hover:bg-primary-100 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Thêm xe
              </button>
            </div>
            {slots.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                Chưa gán xe nào
              </p>
            )}
            <div className="flex flex-col gap-3">
              {slots.map((slot, idx) => {
                const vehicle = vehicles.find((v) => v._id === slot.vehicle);
                const maxCap = vehicle ? VEHICLE_CAPACITY[vehicle.type] : 100;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_120px_auto]"
                  >
                    <Select
                      value={slot.vehicle}
                      onChange={(e) => updateSlot(idx, { vehicle: e.target.value })}
                    >
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.licensePlate} ({VEHICLE_TYPE_LABEL[v.type]}) — {v.driverName}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      max={maxCap}
                      value={slot.capacity}
                      onChange={(e) => updateSlot(idx, { capacity: Number(e.target.value) })}
                      hint={`Tối đa ${maxCap}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="self-start rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100 cursor-pointer"
                      aria-label="Xoá xe khỏi tuyến"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            onClick={onSubmit}
            loading={saving}
            icon={<Save className="h-4 w-4" aria-hidden />}
          >
            {route ? "Lưu thay đổi" : "Tạo tuyến"}
          </Button>
        </div>
      </div>
    </div>
  );
}
