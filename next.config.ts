import type { NextConfig } from "next";
import path from "path";

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.thum.io",
      },
    ],
  },
  // Turbopack config - set root to current directory to fix workspace warning
  turbopack: {
    root: __dirname,
  },
  // Webpack config to fix module resolution
  webpack: (config) => {
    // Ensure webpack resolves modules from the project directory
    const projectRoot = path.resolve(__dirname);
    
    // Set resolve roots to ensure modules are resolved from project directory
    // This prevents webpack from looking in parent directories
    config.resolve.roots = [projectRoot];
    
    // Ensure node_modules resolution starts from project root
    if (Array.isArray(config.resolve.modules)) {
      config.resolve.modules = [
        path.join(projectRoot, 'node_modules'),
        ...config.resolve.modules.filter((m: string) => typeof m === 'string' && !m.includes('node_modules')),
        'node_modules',
      ];
    }
    
    return config;
  },
};

export default nextConfig;
