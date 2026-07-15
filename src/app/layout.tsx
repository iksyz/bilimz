import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={`light ${sourceSans.variable}`} style={{ colorScheme: 'light' }} suppressHydrationWarning>
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

        <Footer />

      </body>
    </html>
  );
}
