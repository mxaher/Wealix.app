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

export const metadata: Metadata = {
  title: "Wealix App",
  description: "Personal Wealth Operating System",
  keywords: ["Wealth", "Net Worth", "Portfolio", "FIRE", "TASI", "EGX", "Saudi", "MENA", "Finance", "Investment"],
  authors: [{ name: "Wealix Team" }],
  icons: {
    icon: [
      { url: "/logo.svg?v=20260327", type: "image/svg+xml" },
      { url: "/favicon.svg?v=20260327", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg?v=20260327",
    apple: "/logo.svg?v=20260327",
  },
  openGraph: {
    title: "Wealix App",
    description: "Personal Wealth Operating System",
    type: "website",
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
        className="antialiased bg-background text-foreground font-sans"
      >
        <ClerkProvider>
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
