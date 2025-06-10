// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin",
        permanent: true, // Set to false if you want a temporary redirect
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://infinitech-api5.site/api/:path*", // Updated Laravel API URL
      },
    ];
  },
};

module.exports = nextConfig;
