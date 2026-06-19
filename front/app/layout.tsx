import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@lib/auth-context";
import "@app/globals.css";

export const metadata: Metadata = {
  title: "1991chat",
  description: "AI chat — System Design exercise",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full bg-neutral-50 text-neutral-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
