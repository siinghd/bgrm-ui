/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['eb189ae152e7401d8bbb9cd934b3367f.r2.cloudflarestorage.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
