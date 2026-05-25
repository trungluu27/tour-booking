import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function resolveAssetUrl(input?: string | null): string | null {
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) return input;
  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${input.startsWith("/") ? input : `/${input}`}`;
}

export function formatDateTime(input?: string | Date | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
