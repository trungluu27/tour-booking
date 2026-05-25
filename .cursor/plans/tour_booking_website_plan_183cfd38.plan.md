---
name: Tour Booking Website Plan
overview: Xây dựng website đặt tour với backend NestJS + MongoDB và frontend Next.js + Tailwind, tách thành 2 folder riêng biệt. Admin quản lý tour/tuyến/xe và xuất link form đăng ký, user truy cập link để đăng ký chọn tuyến.
todos:
  - id: scaffold
    content: Tạo folder backend (NestJS) và frontend (Next.js + Tailwind), cấu hình .env, .gitignore, README
    status: pending
  - id: docker_setup
    content: Tạo docker-compose.yml ở root để host MongoDB (mongo:7 + volume persist), .env cho credentials
    status: pending
  - id: backend_schemas
    content: "Backend: định nghĩa Mongoose schemas Tour/Route/VehicleSlot embed + Vehicle + Booking"
    status: pending
  - id: backend_auth
    content: "Backend: AuthModule với JWT, admin credentials từ env, JwtAuthGuard"
    status: pending
  - id: backend_vehicles
    content: "Backend: VehiclesModule CRUD (admin only)"
    status: pending
  - id: backend_tours_routes
    content: "Backend: ToursModule + nested routes (CRUD, lock, slug, public get by slug)"
    status: pending
  - id: backend_uploads
    content: "Backend: UploadsModule (multer) + serve static folder uploads/"
    status: pending
  - id: backend_bookings
    content: "Backend: BookingsModule với atomic seat counter ($inc + $lt) tránh race condition"
    status: pending
  - id: frontend_design_system
    content: "Frontend: chạy skill .cursor/skills/ui-ux-pro-max để generate design system (style/color/typography/effects) + persist vào design-system/MASTER.md trước khi code UI"
    status: pending
  - id: frontend_setup
    content: "Frontend: setup Tailwind theo design system, axios client, auth context, middleware bảo vệ /admin, tạo public/images, public/icons, public/logo với placeholder assets"
    status: pending
  - id: frontend_admin
    content: "Frontend: trang admin login, tours list/create/edit, vehicles CRUD, route management, bookings table - tuân thủ design system từ ui-ux-pro-max"
    status: pending
  - id: frontend_public
    content: "Frontend: trang public /tour/[slug] với hero background + form đăng ký chọn tuyến/xe, trang success - tuân thủ design system từ ui-ux-pro-max"
    status: pending
  - id: polish
    content: "Polish: validation form, toast feedback, copy-link button, lock/close/delete tour flows, xóa file ảnh khi hard delete"
    status: pending
isProject: false
---

## Cấu trúc thư mục

```
tour-booking/
├── docker-compose.yml          # Host MongoDB (+ volume persist data)
├── .env                        # MONGO_ROOT_USER, MONGO_ROOT_PASS, MONGO_DB
├── backend/                    # NestJS + MongoDB (Mongoose)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT login cho admin
│   │   │   ├── tours/          # CRUD tour
│   │   │   ├── routes/         # CRUD tuyến (sub-resource của tour)
│   │   │   ├── vehicles/       # CRUD xe (pool dùng chung)
│   │   │   ├── bookings/       # User đăng ký + admin xem
│   │   │   └── uploads/        # Upload ảnh background
│   │   ├── schemas/            # Mongoose schemas
│   │   ├── common/             # Guards, decorators, pipes
│   │   └── main.ts
│   ├── uploads/                # Folder lưu ảnh tour (gitignored)
│   ├── .env                    # MONGO_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS
│   └── package.json
│
├── frontend/                   # Next.js (App Router) + Tailwind
│   ├── app/
│   │   ├── (admin)/admin/      # Khu vực admin (có middleware bảo vệ)
│   │   │   ├── login/
│   │   │   ├── tours/          # List, create, edit
│   │   │   │   └── [id]/       # Detail: routes, vehicles, bookings
│   │   │   └── vehicles/       # Quản lý pool xe
│   │   ├── tour/[slug]/        # Trang public form đăng ký
│   │   │   └── success/
│   │   └── layout.tsx
│   ├── components/
│   ├── public/                 # Static assets (Next.js serve trực tiếp)
│   │   ├── images/             # Ảnh landing page, hero default, placeholder
│   │   ├── icons/              # SVG icons custom (ngoài lucide-react)
│   │   ├── logo/               # Logo brand
│   │   └── favicon.ico
│   ├── lib/api.ts              # Axios client gọi backend
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   └── package.json
│
└── README.md
```

## Data Model (MongoDB / Mongoose)

```mermaid
erDiagram
    Tour ||--o{ Route : has
    Route ||--o{ VehicleSlot : contains
    VehicleSlot }o--|| Vehicle : references
    Booking }o--|| Tour : belongs_to
    Booking }o--|| Route : selects
    Booking }o--|| VehicleSlot : assigned_to

    Tour { string title string description string backgroundImage string slug bool locked string status }
    Route { string name string description datetime departureTime }
    VehicleSlot { ObjectId vehicle int capacity int booked }
    Vehicle { string type string licensePlate string driverName string driverPhone }
    Booking { string fullName string phone string email string note }
```

- **Vehicle** là pool dùng chung (reusable giữa nhiều tour): `type` (29/16/7/4 chỗ), `licensePlate`, `driverName`, `driverPhone`. `capacity` suy ra từ `type`.
- **Tour**: `title`, `description`, `backgroundImage`, `slug` (auto-generate cho public link), `locked` (khoá form), `status` (active/closed).
- **Route** (tuyến): embed trong Tour hoặc collection riêng có `tourId`. Mỗi route chứa danh sách `vehicleSlots` (xe nào đi tuyến này + sức chứa).
- **Booking**: lưu thông tin user + tour/route/vehicle đã chọn. Counter `booked` trên VehicleSlot tăng khi có booking mới.

## Backend - NestJS Modules

- **AuthModule**: `POST /auth/login` (username/password từ env), trả JWT. Guard `JwtAuthGuard` cho các endpoint admin.
- **VehiclesModule**: `GET/POST/PUT/DELETE /vehicles` (admin only).
- **ToursModule**:
  - Admin: `POST /tours`, `PUT /tours/:id`, `DELETE /tours/:id`, `PATCH /tours/:id/lock`, `GET /tours` (list).
  - Public: `GET /tours/slug/:slug` (chỉ trả khi không locked, không closed).
- **RoutesModule** (nested under tour): `POST/PUT/DELETE /tours/:tourId/routes/:routeId`, gán xe: `PUT /tours/:tourId/routes/:routeId/vehicles`.
- **BookingsModule**:
  - Public: `POST /tours/:slug/bookings` - validate route/vehicle còn chỗ, tăng counter atomically (dùng `$inc` + `$lt` để tránh race condition).
  - Admin: `GET /tours/:tourId/bookings`, `DELETE /bookings/:id`.
- **UploadsModule**: `POST /uploads` dùng `MulterModule`, lưu vào `backend/uploads/`, trả về URL `/static/...`. `main.ts` serve static folder `uploads`.

Key snippet cho atomic seat counter:

```typescript
const updated = await this.tourModel.findOneAndUpdate(
  { _id: tourId, 'routes._id': routeId, 'routes.vehicleSlots._id': slotId,
    'routes.vehicleSlots.booked': { $lt: capacity } },
  { $inc: { 'routes.$[r].vehicleSlots.$[s].booked': 1 } },
  { arrayFilters: [{ 'r._id': routeId }, { 's._id': slotId }], new: true }
);
if (!updated) throw new ConflictException('Hết chỗ');
```

## UI/UX Design Guidelines (BẮT BUỘC dùng skill `ui-ux-pro-max`)

Trước khi viết bất kỳ component UI nào, **PHẢI** dùng skill `.cursor/skills/ui-ux-pro-max` để lấy design system chuẩn (style, palette, typography, effects, anti-patterns). Quy trình:

### Bước 1: Generate design system & persist (chạy 1 lần ở đầu phase frontend)

```bash
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "travel tour booking service vietnamese elegant modern" \
  --design-system --persist -p "Tour Booking" \
  --stack nextjs
```

Lệnh trên tạo:
- `design-system/MASTER.md` - Source of Truth toàn dự án (dùng cho mọi page).
- `design-system/pages/` - Folder chứa override cho từng page cụ thể nếu cần.

### Bước 2: Tạo override cho các trang đặc thù (nếu cần)

```bash
# Trang public form đăng ký - cần hero-centric, cảm xúc, thúc đẩy convert
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "tour booking landing hero conversion" \
  --design-system --persist -p "Tour Booking" --page "tour-public"

# Trang admin - cần dashboard productivity, dày data
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "admin dashboard productivity data table" \
  --design-system --persist -p "Tour Booking" --page "admin"
```

### Bước 3: Tra cứu supplement khi triển khai từng component

```bash
# UX cho form (validation, accessibility)
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "form validation accessibility" --domain ux

# Stack guideline Next.js (SSR, Image, routing)
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "image form layout" --stack nextjs

# Tailwind utilities cho card / glass effect
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "card glass hover" --stack html-tailwind
```

### Quy tắc bắt buộc khi code UI (theo Pre-Delivery Checklist của skill)

- **Icon**: chỉ dùng SVG (`lucide-react` đã liệt kê trong dependencies), KHÔNG dùng emoji làm icon.
- **Cursor**: mọi phần tử clickable / hoverable phải có `cursor-pointer`.
- **Hover**: dùng transition màu/shadow/border, KHÔNG dùng `scale` gây layout shift.
- **Contrast**: light mode dùng `slate-900` cho text chính, `slate-600` cho muted; KHÔNG dùng `gray-400` hoặc nhạt hơn cho body text.
- **Border**: light mode dùng `border-gray-200`, KHÔNG dùng `border-white/10` (vô hình).
- **Glass card light mode**: `bg-white/80` trở lên, KHÔNG dùng `bg-white/10`.
- **Floating navbar**: chừa `top-4 left-4 right-4`, KHÔNG dán sát mép.
- **Responsive**: test ở 375px, 768px, 1024px, 1440px; không scroll ngang trên mobile.
- **Accessibility**: alt text cho ảnh, label cho input, `prefers-reduced-motion` được tôn trọng.

Khi review/QA UI cuối phase `polish`, chạy lại checklist trong SKILL.md để verify trước khi đóng todo.

## Frontend - Next.js Pages

**Admin (`/admin/*`)** - bảo vệ bằng middleware kiểm tra token trong cookie/localStorage:
- `/admin/login` - form đăng nhập.
- `/admin/tours` - list tour (card có ảnh bg), nút tạo mới, lock/unlock, xoá, copy link form public.
- `/admin/tours/new` & `/admin/tours/[id]/edit` - form title, description, upload ảnh bg.
- `/admin/tours/[id]` - tab quản lý:
  - **Tuyến**: thêm/sửa/xoá route, gán xe (multi-select từ pool) + đặt capacity.
  - **Bookings**: bảng danh sách đăng ký, filter theo tuyến/xe, export.
- `/admin/vehicles` - CRUD pool xe.

**Public (`/tour/[slug]`)**:
- Hero section dùng `backgroundImage` của tour, hiển thị title/description.
- Form đăng ký: họ tên, sđt, email, ghi chú, chọn **tuyến** (dropdown), sau đó chọn **xe** trong tuyến đó (hiển thị loại xe + còn bao nhiêu chỗ, disable xe đã hết).
- Submit -> `POST /tours/:slug/bookings` -> redirect `/tour/[slug]/success`.
- Nếu tour bị lock hoặc closed: hiển thị thông báo "Đã đủ số lượng / Đã đóng".

## Các tính năng đặc biệt theo yêu cầu

- **Xuất link form**: nút "Copy link" trong admin tour list, copy `https://<frontend>/tour/<slug>` vào clipboard.
- **Khoá link khi đủ số lượng**: nút toggle `locked` trên tour. Có thể tự động lock khi tổng booked = tổng capacity (cron hoặc check sau mỗi booking).
- **Xoá tour cũ tránh lưu trữ nhiều**: nút "Đóng tour" (soft - set `status: closed`) và nút "Xoá vĩnh viễn" (hard delete tour + routes + bookings + xoá file ảnh background trong `uploads/`).
- **Mỗi tour có ảnh background riêng**: lưu path file trong `Tour.backgroundImage`, serve qua `/static/uploads/...`.

## Docker setup (host MongoDB)

File `docker-compose.yml` ở root, chỉ chạy MongoDB. Backend/frontend vẫn chạy local bằng `npm run start:dev` / `npm run dev` để dev tiện debug.

```yaml
services:
  mongo:
    image: mongo:7
    container_name: tour-booking-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASS}
      MONGO_INITDB_DATABASE: ${MONGO_DB}
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongo_data:
```

- `.env` ở root chứa `MONGO_ROOT_USER`, `MONGO_ROOT_PASS`, `MONGO_DB=tour_booking`.
- Backend `.env` -> `MONGO_URI=mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASS}@localhost:27017/tour_booking?authSource=admin`.
- Commands: `docker compose up -d` (start), `docker compose down` (stop), `docker compose down -v` (xoá data).
- Volume `mongo_data` persist data giữa các lần restart container.

## Frontend assets

Theo chuẩn Next.js, dùng folder `frontend/public/` để Next serve static trực tiếp tại root URL:

- `public/images/` - ảnh landing page, hero default (khi tour chưa có ảnh bg), placeholder, banner.
- `public/icons/` - SVG icon custom (vd: bus.svg, route.svg) bổ sung cho thư viện `lucide-react`.
- `public/logo/` - logo brand (`logo.svg`, `logo-dark.svg`).
- `public/favicon.ico` - favicon trang web.

Cách dùng trong code:

```tsx
import Image from 'next/image';
import logo from '/public/logo/logo.svg';

<Image src="/images/hero-default.jpg" alt="Hero" fill priority />
<img src="/icons/bus.svg" alt="" className="w-6 h-6" />
```

Lưu ý phân biệt:
- `frontend/public/` - asset tĩnh của **website** (do dev cung cấp, commit vào repo).
- `backend/uploads/` - ảnh **do admin upload** runtime (tour background), không commit.

## Dependencies chính

- Backend: `@nestjs/core`, `@nestjs/mongoose`, `mongoose`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `multer`, `@nestjs/serve-static`.
- Frontend: `next`, `react`, `tailwindcss`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react` (icons), `sonner` (toast).

## Thứ tự triển khai (todos)