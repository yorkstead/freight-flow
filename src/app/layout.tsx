import type { Metadata } from "next";
import "./globals.css";

/**
 * Root layout — wraps every page in the application.
 *
 * This is the only place you should set <html> and <body> tags.
 * Global providers (auth, theme, etc.) go here when you need them.
 */

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Yorkstead App";

export const metadata: Metadata = {
  title: appName,
  description: `${appName} — built by Yorkstead Systems`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
