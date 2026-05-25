import { PublicTourSummary } from "./types";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function fetchPublicTours(limit = 6): Promise<PublicTourSummary[]> {
  try {
    const res = await fetch(`${baseURL}/tours/public?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as PublicTourSummary[];
  } catch {
    return [];
  }
}
