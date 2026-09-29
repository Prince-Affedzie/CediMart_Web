/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'fiuzyubyzaazvirsqqjq.supabase.co', port: '', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      {
        // Catch all traffic coming to the www domain
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.cedimartgh.com',
          },
        ],
        // Redirect it to the non-www domain, keeping the exact path intact
        destination: 'https://cedimartgh.com/:path*',
        permanent: true, // This tells Google it's a 301 Permanent Redirect
      },
    ];
  },
};

export default nextConfig;