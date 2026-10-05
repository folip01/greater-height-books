import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: { default: "Greater Height Books", template: "%s | Greater Height Books" },
  description: "English and Mathematics reasoning books for young learners.",
  manifest: "/manifest.webmanifest",
  applicationName: "Greater Height Books",
  appleWebApp: { capable: true, title: "Greater Height Books", statusBarStyle: "default" },
  icons: { icon: "/icons/app-192.png", apple: "/icons/app-192.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ServiceWorkerRegistration/><Header/><main>{children}</main><Footer/></body></html>;
}
