
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin(
  // This is the default shape of the plugin, pointing to the i18n file
  './src/i18n.ts'
);
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
 
export default withNextIntl(nextConfig);
