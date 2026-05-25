/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/static/**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
