import type { Metadata } from "next";
import { AuthCompletion } from "@/components/AuthCompletion";

export const metadata: Metadata = { title: "Finishing sign-in" };

export default async function AuthCompletePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account";
  return <AuthCompletion next={next}/>;
}
