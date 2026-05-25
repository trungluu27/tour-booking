export type VehicleType = "4" | "7" | "16" | "29" | "45";

export interface Vehicle {
  _id: string;
  type: VehicleType;
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleSlot {
  _id: string;
  vehicle: string;
  capacity: number;
  booked: number;
  vehicleInfo?: Vehicle | null;
}

export interface RouteItem {
  _id: string;
  name: string;
  description?: string;
  departureTime?: string;
  vehicleSlots: VehicleSlot[];
}

export interface Tour {
  _id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  slug: string;
  locked: boolean;
  status: "active" | "closed";
  routes: RouteItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  tour: string;
  tourSlug: string;
  routeId: string;
  routeName: string;
  vehicleSlotId: string;
  vehicleId: string;
  vehicleType: string;
  vehiclePlate: string;
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  createdAt: string;
}

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  "4": "4 chỗ",
  "7": "7 chỗ",
  "16": "16 chỗ",
  "29": "29 chỗ",
  "45": "45 chỗ",
};

export const VEHICLE_CAPACITY: Record<VehicleType, number> = {
  "4": 4,
  "7": 7,
  "16": 16,
  "29": 29,
  "45": 45,
};

export interface PublicTourSummary {
  _id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  slug: string;
  locked: boolean;
  routeCount: number;
  totalCapacity: number;
  totalBooked: number;
  seatsLeft: number;
  earliestDeparture: string | null;
}
