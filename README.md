# Tour Booking Website

Website đặt tour du lịch với:

- **Backend**: NestJS + MongoDB (Mongoose) - JWT auth, CRUD tour/route/vehicle, atomic seat counter.
- **Frontend**: Next.js (App Router) + Tailwind - admin dashboard + public booking form.
- **Database**: MongoDB chạy trong Docker container.

## Cấu trúc

```
tour-booking/
├── docker-compose.yml      # MongoDB host
├── .env                    # MongoDB credentials (gitignored)
├── backend/                # NestJS API
└── frontend/               # Next.js UI
```

## Quick start

### 1. Khởi động MongoDB

```bash
cp .env.example .env       # chỉnh sửa password nếu cần
docker compose up -d
docker compose logs -f mongo   # check log
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # chỉnh JWT_SECRET, ADMIN_USER, ADMIN_PASS
npm install
npm run start:dev          # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000
```

### 4. Đăng nhập admin

- Truy cập `http://localhost:3000/admin/login`
- Tài khoản default trong `backend/.env`: `ADMIN_USER=admin` / `ADMIN_PASS=admin123`

## Commands

| Lệnh | Mô tả |
|------|-------|
| `docker compose up -d` | Start MongoDB |
| `docker compose down` | Stop MongoDB (giữ data) |
| `docker compose down -v` | Stop + xoá volume (mất data) |

## Tech stack

- Backend: NestJS, Mongoose, Passport JWT, Multer, class-validator
- Frontend: Next.js 15, React 19, Tailwind CSS 4, React Hook Form, Zod, Sonner (toast), Lucide icons
