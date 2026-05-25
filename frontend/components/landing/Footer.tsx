import Link from "next/link";
import { Bus, Mail, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/landing-content";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-900 to-primary-600 text-white">
              <Bus className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-slate-900">
                {BRAND.name}
              </span>
              <span className="text-xs text-slate-500">{BRAND.tagline}</span>
            </div>
          </Link>
          <p className="mt-4 max-w-md text-sm text-slate-600">
            Đơn vị tổ chức tour du lịch trong nước, cam kết minh bạch về xe,
            tuyến đường và số chỗ ngồi. Phục vụ khách lẻ, gia đình và đoàn công
            ty.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Khám phá</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <a
                href="#tours"
                className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
              >
                Tour đang mở
              </a>
            </li>
            <li>
              <a
                href="#uu-dai"
                className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
              >
                Ưu đãi
              </a>
            </li>
            <li>
              <a
                href="#danh-gia"
                className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
              >
                Đánh giá khách hàng
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Liên hệ</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary-700" aria-hidden />
              <a
                href={`tel:${BRAND.hotline.replace(/\s/g, "")}`}
                className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
              >
                {BRAND.hotline}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary-700" aria-hidden />
              <a
                href={`mailto:${BRAND.email}`}
                className="transition-colors duration-200 hover:text-primary-900 cursor-pointer"
              >
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary-700" aria-hidden />
              <span>{BRAND.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. Đã đăng ký bản quyền.
        </p>
        <Link
          href="/admin/login"
          className="opacity-60 transition-opacity duration-200 hover:opacity-100 hover:text-primary-700 cursor-pointer"
        >
          Khu vực quản trị
        </Link>
      </div>
    </footer>
  );
}
