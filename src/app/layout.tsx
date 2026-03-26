import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { LocaleSync } from "@/components/layout/LocaleSync";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wealix App",
  description: "Personal Wealth Operating System",
  keywords: ["Wealth", "Net Worth", "Portfolio", "FIRE", "TASI", "EGX", "Saudi", "MENA", "Finance", "Investment"],
  authors: [{ name: "Wealix Team" }],
  icons: {
    icon: "/logo.svg",
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
    <html lang="ar" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleSync />
            <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-end px-4 py-4">
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 shadow-lg backdrop-blur">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Sign up</Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
