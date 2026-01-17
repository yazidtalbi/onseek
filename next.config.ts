import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-select"],
  },
  // Optimize images if used
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Turbopack config - set root to current directory to fix workspace warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
