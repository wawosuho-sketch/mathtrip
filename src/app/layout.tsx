"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { siteConfig, withBasePath } from "@/site.config";

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
      <head>
        <title>{siteConfig.appTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content={siteConfig.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteConfig.appShortName} />
        <link rel="manifest" href={withBasePath("/manifest.json")} />
        <link rel="apple-touch-icon" href={withBasePath("/icon-192.png")} />
      </head>
      <body className={inter.className}>
        <div className={`app-container ${isTeacherPage ? 'wide-container' : ''}`}>
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

