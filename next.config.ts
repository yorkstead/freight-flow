import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/sw.js", headers: [
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
    ] }];
  },
  // Vercel manages its own traced deployment output. Standalone is retained
  // for the self-hosted Docker image, where it keeps the runtime small.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
