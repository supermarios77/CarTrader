import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  // API rewrites for backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  },
  // Disable HTTP/2 to avoid ALPN negotiation issues in development
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  // Webpack configuration to resolve modules from workspace root
  webpack: (config, { isServer }) => {
    // Resolve modules from workspace root (for pnpm workspaces)
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules',
    ];
    return config;
  },
};

export default nextConfig;
