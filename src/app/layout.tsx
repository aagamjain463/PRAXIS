import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const editorial = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-editorial", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Praxis — Turn what you learn into what you do", template: "%s · Praxis" },
  description: "Capture useful ideas, turn them into action, and remember them when they matter.",
  applicationName: "Praxis",
  openGraph: {
    title: "Praxis — Turn what you learn into what you do",
    description: "The action layer for everything you learn.",
    type: "website"
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f2ea" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${editorial.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
