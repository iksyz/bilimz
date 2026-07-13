import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScienceOne - Global Science Discovery",
  description: "Where data, theories, and discoveries converge.",
  openGraph: {
    title: "ScienceOne - Global Science Discovery",
    description: "Where data, theories, and discoveries converge.",
    url: "https://scienceone.net",
    siteName: "ScienceOne",
    images: [
      {
        url: "https://scienceone.net/og-default.jpg", // Make sure to have a default image here
        width: 1200,
        height: 630,
        alt: "ScienceOne",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScienceOne - Global Science Discovery",
    description: "Where data, theories, and discoveries converge.",
    images: ["https://scienceone.net/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${geistSans.variable} ${geistMono.variable}`} style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20">
        
        {/* Minimal Navbar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
            <MainNav />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Muted Footer */}
        <footer className="border-t bg-muted">
          <div className="container mx-auto py-8 px-4 md:px-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ScienceOne.net. All rights reserved.</p>
          </div>
        </footer>

      </body>
    </html>
  );
}
