import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// New architecture providers
import { AppProviders } from "@/contexts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E2E Robot - AI-Powered Testing Automation",
  description: "Intelligent end-to-end testing automation powered by Claude AI",
  keywords: ["E2E Testing", "AI", "Automation", "Claude", "Playwright", "TypeScript"],
  authors: [{ name: "E2E Robot Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}