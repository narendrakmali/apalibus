
import createNextIntlPlugin from 'next-intl/plugin';

// 🔴 CRITICAL: Point this to your file location
const withNextIntl = createNextIntlPlugin('./src/i18n.ts'); 

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your other config settings...
};

export default withNextIntl(nextConfig);
