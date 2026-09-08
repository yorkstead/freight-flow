import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel manages its own traced deployment output. Standalone is retained
  // for the self-hosted Docker image, where it keeps the runtime small.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
