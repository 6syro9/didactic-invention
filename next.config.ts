import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'cilsrdpvqtgutxprdofn.supabase.co', // For the FASHN logo
      'cdn.fashn.ai', // For FASHN API result images
      'api.fashn.ai', // Another potential domain for FASHN images
      'app.fashn.ai', // For FASHN example model images
      'images.pexels.com', // For Pexels garment example images
      'v3.fal.media', // For example images in documentation
      'custom-icon-badges.demolab.com', // For badges
      'img.shields.io',
      'ibb.co'
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: [] }
  },
};

export default nextConfig;
