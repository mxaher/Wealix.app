import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { LocaleSync } from "@/components/layout/LocaleSync";
import { ClerkSync } from "@/components/layout/ClerkSync";
import { RemoteProfileSync } from "@/components/layout/RemoteProfileSync";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wealix — AI Portfolio Tracker & FIRE Planner for MENA",
    template: "%s | Wealix",
  },
  description:
    "Track your net worth, analyze your investment portfolio across TASI, EGX & NASDAQ, and plan financial independence with AI. Built for Saudi Arabia, UAE, and Egypt. Start your 14-day free trial.",
  keywords: [
    "portfolio tracker Saudi Arabia",
    "FIRE calculator MENA",
    "net worth tracker",
    "AI financial advisor",
    "TASI investment tracker",
    "EGX portfolio",
    "financial independence Saudi",
    "wealth management app",
    "حاسبة الاستقلال المالي",
    "تتبع المحفظة الاستثمارية",
    "صافي الثروة",
    "تداول تحليل",
    "استقلال مالي السعودية",
    "مستشار مالي ذكي",
    "FIRE Saudi Arabia",
    "retirement planning MENA",
  ],
  authors: [{ name: "Wealix Team", url: siteUrl }],
  creator: "Wealix",
  publisher: "Wealix",
  category: "finance",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    url: siteUrl,
    siteName: "Wealix",
    title: "Wealix — AI Portfolio Tracker & FIRE Planner for MENA",
    description:
      "Track your net worth, analyze your investment portfolio across TASI, EGX & NASDAQ, and plan financial independence with AI. Built for Saudi Arabia, UAE, and Egypt.",
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: "Wealix — AI Wealth Operating System for MENA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@WealixApp",
    creator: "@WealixApp",
    title: "Wealix — AI Portfolio Tracker & FIRE Planner for MENA",
    description:
      "Track portfolios across TASI, EGX & NASDAQ. Plan FIRE. Get AI-powered wealth advice. Built for Saudi Arabia, UAE & Egypt.",
    images: ["/og/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/brand/logo-fav-icon.png?v=20260331a", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/brand/logo-fav-icon.png?v=20260331a",
    apple: "/brand/logo-fav-icon.png?v=20260331a",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-US": siteUrl,
      "ar-SA": siteUrl,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="/"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleSync />
            <ClerkSync />
            <RemoteProfileSync />
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
