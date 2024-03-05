/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artworks.thetvdb.com',
        port: '',
        pathname: '/banners/**',
      },
    ],
  },
};

export default nextConfig;
