/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is intentionally used to stay deployable on Firebase Spark plan.
  // Server runtime features (e.g. Next.js API routes) should not be used.
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
