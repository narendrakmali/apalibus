// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

// Point this to where your request.ts or i18n.ts file actually lives
const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts' 
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // We can keep reactStrictMode true for safety
  reactStrictMode: true,
  
  // OPTIONAL: If you are using images from external domains (like Google/Firebase storage)
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'firebasestorage.googleapis.com',
  //     },
  //   ],
  // },
};

export default withNextIntl(nextConfig);