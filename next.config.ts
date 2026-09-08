import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" produces a self-contained build that includes only the
  // files needed to run — no node_modules required in production.
  // This is what makes Docker images small and self-hosting simple.
  output: "standalone",
};

export default nextConfig;
