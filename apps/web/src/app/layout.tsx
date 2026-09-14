import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlindScrum — Ephemeral Planning Poker",
  description:
    "Stealth, real-time, zero-persistence scrum poker estimation with voice input, Fibonacci deck, and consensus analytics.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🃏</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500/20 selection:text-indigo-400 min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            richColors
            position="bottom-right"
            toastOptions={{
              className: "!rounded-2xl !font-sans !shadow-xl",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
