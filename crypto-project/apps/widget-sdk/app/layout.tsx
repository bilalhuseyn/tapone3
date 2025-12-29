// Dosya: apps/widget-sdk/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 👈 İŞTE SİHİRLİ KABLO BURADA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TapOne Widget",
  description: "Secure Crypto Widget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}