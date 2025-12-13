/** @type {import('next').NextConfig} */
const nextConfig = {
  // We keep this empty of "experimental" options to avoid crashes
};

const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl(nextConfig);
