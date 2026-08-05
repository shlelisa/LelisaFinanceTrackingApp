import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Providers from "./providers";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import BudgetAlertWatcher from "@/components/BudgetAlertWatcher";
import AIChatbotWidget from "@/components/AIChatbotWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LelisaFin",
  description: "Lelisa Finance Tracking App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <AuthProvider>
            <div className="flex min-h-screen md:flex-row">
              <Sidebar />
              <main className="flex flex-1 flex-col min-w-0">
                <TopBar />
                <div className="flex-1">{children}</div>
              </main>
            </div>
            <AIChatbotWidget />
          </AuthProvider>
          <Toaster richColors position="top-right" />
          <BudgetAlertWatcher />
        </Providers>
      </body>
    </html>
  );
}
