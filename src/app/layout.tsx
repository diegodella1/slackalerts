import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { AlertNotification } from "@/components/AlertNotification";
import { AutoFetchStatus } from "@/components/AutoFetchStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bitcoin Price Alerts",
  description: "Monitor Bitcoin price and get real-time alerts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AlertNotification />
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <AutoFetchStatus />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
