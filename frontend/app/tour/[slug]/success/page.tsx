import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="aurora-bg grid min-h-screen place-items-center px-4 py-16">
      <div className="glass-card max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Đăng ký thành công!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ qua số điện thoại đã cung cấp
          để xác nhận thông tin.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link href={`/tour/${slug}`} className="btn-primary">
            Quay lại trang tour
          </Link>
          <p className="text-xs text-slate-500">
            <Phone className="mr-1 inline h-3 w-3" aria-hidden />
            Có thắc mắc, vui lòng liên hệ admin tour
          </p>
        </div>
      </div>
    </main>
  );
}
