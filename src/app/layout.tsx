// Hapus 'use client' dari sini dan pindahkan ke komponen terpisah jika diperlukan
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tambahkan metadata untuk SEO dan routing yang lebih baik
export const metadata: Metadata = {
  title: "StudyHub - Platform Belajar Online",
  description: "Platform belajar online untuk meningkatkan produktivitas belajar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
