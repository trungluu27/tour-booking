import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
