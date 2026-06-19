import type { Metadata } from "next";
import { Michroma, Mulish } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@lib/auth-context";
import "@app/globals.css";

// Body text — a clean, slightly characterful humanist sans.
const bodyFont = Mulish({ subsets: ["latin"], variable: "--font-body" });
// Display — the "1991chat" wordmark only (techy, fits the 1991 vibe).
const displayFont = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "1991chat",
  description: "AI chat — System Design exercise",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="h-full bg-neutral-50 text-neutral-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
