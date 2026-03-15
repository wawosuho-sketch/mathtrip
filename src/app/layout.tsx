"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isTeacherPage = pathname?.startsWith('/teacher');

  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className={`app-container ${isTeacherPage ? 'wide-container' : ''}`}>
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

