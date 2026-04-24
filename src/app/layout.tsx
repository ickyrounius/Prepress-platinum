import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/AuthContext";
import { NotificationProvider } from "@/features/notification/NotificationContext";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import "./globals.css";

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Prepress Platinum",
  description: "Advanced Prepress Workflow & Reporting System",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Prepress Platinum",
    statusBarStyle: "default",
    startupImage: [],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased text-slate-800 bg-slate-50 dark:text-slate-200 dark:bg-slate-900`}
      >
        <NotificationProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
