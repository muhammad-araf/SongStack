import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SongStack - Batch Song Downloader | OCR & Manual Input",
  description: "Download songs from playlist screenshots using AI-powered OCR or manual input. Batch download with progress tracking, file size display, and more.",
  keywords: ["song downloader", "batch download", "playlist", "OCR", "YouTube", "music download"],
  authors: [{ name: "SongStack Team" }],
  creator: "SongStack",
  publisher: "SongStack",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "http://localhost:3000",
    siteName: "SongStack",
    title: "SongStack - Batch Song Downloader",
    description: "Download songs from playlist screenshots using AI-powered OCR or manual input",
    images: [
      {
        url: "/musicLogo.png",
        width: 1200,
        height: 630,
        alt: "SongStack - Batch Song Downloader",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SongStack - Batch Song Downloader",
    description: "Download songs from playlist screenshots using AI-powered OCR or manual input",
    images: ["/musicLogo.png"],
    creator: "@songstack",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
