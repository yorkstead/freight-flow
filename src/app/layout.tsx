import type { Metadata, Viewport } from "next";
import { Pwa } from "@/components/pwa";
import "./globals.css";
import { DemoSimulationProvider } from "@/components/demo-simulation";

/**
 * Root layout — wraps every page in the application.
 *
 * This is the only place you should set <html> and <body> tags.
 * Global providers (auth, theme, etc.) go here when you need them.
 */

const appName = "FreightFlow Control Tower";

export const metadata: Metadata = {
  title: appName,
  description: `${appName} — operational intelligence for freight teams`,
  applicationName: appName,
  appleWebApp: { capable: true, title: "FreightFlow", statusBarStyle: "default" },
  icons: { apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }] },
};

export const viewport: Viewport = { themeColor: "#0b0e12" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0e12] text-slate-100 antialiased">
        <DemoSimulationProvider>{children}</DemoSimulationProvider>
        <Pwa />
      </body>
    </html>
  );
}
