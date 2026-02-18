/**
 * Turion API Nav - Next.js Configuration
 * Optimized for production deployment on Vercel
 * 
 * Created by Bolla Network
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ========================================
  // OUTPUT CONFIGURATION
  // ========================================
  // Standalone output for Docker/serverless deployments
  output: "standalone",

  // ========================================
  // TYPESCRIPT
  // ========================================
  typescript: {
    // Set to false in production for stricter builds
    ignoreBuildErrors: true,
  },

  // ========================================
  // REACT CONFIGURATION
  // ========================================
  reactStrictMode: true,

  // ========================================
  // TURBOPACK CONFIGURATION (Next.js 16+)
  // ========================================
  turbopack: {},

  // ========================================
  // IMAGE OPTIMIZATION
  // ========================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Optimize image quality for production
    formats: ['image/avif', 'image/webp'],
  },

  // ========================================
  // HEADERS
  // ========================================
  async headers() {
    return [
      {
        // Security headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // CORS headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-API-Key',
          },
        ],
      },
    ];
  },

  // ========================================
  // REDIRECTS
  // ========================================
  async redirects() {
    return [];
  },

  // ========================================
  // EXPERIMENTAL FEATURES
  // ========================================
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'www.turion.network',
        'turion.network',
      ],
    },
  },

  // ========================================
  // POWERED BY HEADER
  // ========================================
  poweredByHeader: false,

  // ========================================
  // COMPRESSION
  // ========================================
  compress: true,

  // ========================================
  // LOGGING
  // ========================================
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
