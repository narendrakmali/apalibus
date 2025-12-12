/** @type {import('next').NextConfig} */
const nextConfig = {
  // Correctly place turbo configuration at the root level
  experimental: {
    // Other experimental flags can go here if needed
  },
  // Ensure turbo options are not nested in experimental
  // This section is what the logs indicated was incorrect.
  // By removing the invalid 'turbo' key from 'experimental', the config becomes valid.
  // If specific turbo options were needed, they would go here at the root level, like:
  // turbo: {
  //   rules: { ... }
  // }
  // For now, removing the invalid structure is the fix.
};

module.exports = nextConfig;
