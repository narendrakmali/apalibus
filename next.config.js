/** @type {import('next').NextConfig} */
const nextConfig = {
  turbo: {
    // This tells Next.js that the project root is the current directory,
    // which resolves the "couldn't find the Next.js package" error.
    root: __dirname,
  },
};

module.exports = nextConfig;
