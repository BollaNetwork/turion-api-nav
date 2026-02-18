import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turion - High-Performance Web Scraping API",
  description: "Enterprise-grade browser automation API. Render pages, capture screenshots, and extract data at scale. Pay per request, no commitments.",
  keywords: ["web scraping", "browser automation", "API", "Playwright", "headless browser", "data extraction", "screenshot API", "PDF generation"],
  authors: [{ name: "Turion Network" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Turion - High-Performance Web Scraping API",
    description: "Enterprise-grade browser automation API. Render pages, capture screenshots, and extract data at scale.",
    url: "https://turion.network",
    siteName: "Turion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turion - High-Performance Web Scraping API",
    description: "Enterprise-grade browser automation API. Render pages, capture screenshots, and extract data at scale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
