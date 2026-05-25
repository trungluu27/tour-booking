"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Bus, LogIn } from "lucide-react";

import { Button, Input } from "@/components/UI";
import { api, setAuthToken, extractErrorMessage } from "@/lib/api";

const schema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "admin", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", values);
      setAuthToken(data.accessToken);
      toast.success("Đăng nhập thành công");
      const target = search.get("from") || "/admin/tours";
      router.push(target);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Tên đăng nhập"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button
        type="submit"
        loading={loading}
        icon={<LogIn className="h-4 w-4" aria-hidden />}
        className="mt-2"
      >
        Đăng nhập
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="aurora-bg flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-900 hover:text-primary-700 transition-colors duration-200 cursor-pointer"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-900 text-white">
            <Bus className="h-4 w-4" aria-hidden />
          </span>
          Tour Booking
        </Link>

        <div className="glass-card rounded-3xl p-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Đăng nhập quản trị
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sử dụng tài khoản admin được cấp để quản lý tour.
          </p>

          <Suspense
            fallback={<div className="mt-6 h-32 animate-pulse rounded-xl bg-slate-100" />}
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
