const nextConfig = {
  allowedDevOrigins: ['acceptant-pervasively-eleonore.ngrok-free.dev'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
export default nextConfig;
