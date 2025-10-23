import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-optimized configuration
  eslint: {
    ignoreDuringBuilds: true, // Can be set to false once all ESLint issues are resolved
  },
  typescript: {
    ignoreBuildErrors: false, // Enable type checking for production
  },
  
  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ],
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/designers-list',
        destination: '/landing/designers',
        permanent: true,
      },
      {
        source: '/suppliers-list',
        destination: '/landing/suppliers',
        permanent: true,
      }
    ];
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },

  // Serverless function configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    appName: 'Women in Design',
    version: '1.0.0',
  },
};

export default nextConfig;