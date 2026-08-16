import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a minimal server.js — lets the Docker image
  // run without a full node_modules install.
  output: "standalone",
};

export default nextConfig;
