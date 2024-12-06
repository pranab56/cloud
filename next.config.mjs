/** @type {import('next').NextConfig} */
const nextConfig = {
    siteUrl: 'https://yourdomain.com',
    generateRobotsTxt: true,
    reactStrictMode: true,
    experimental: {
    appDir: true, // Ensure this is enabled for the App Router
  },
};




export default nextConfig;
