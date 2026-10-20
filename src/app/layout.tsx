import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAE101 — Trắc nghiệm tương tác",
  description: "MAE101 Calculus & Linear Algebra — Trắc nghiệm 10 câu, chấm tự động, lời giải từng bước.",
  keywords: ["MAE101", "Calculus", "Linear Algebra", "MathJax", "Quiz"],
  authors: [{ name: "MAE101" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0b0b0b", color: "#f2f2f2" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
