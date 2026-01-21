import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Remove hardcoded turbopack root - let it use the project path automatically
  // This fixes Netlify deployment issues
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
