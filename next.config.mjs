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
};

export default nextConfig;
