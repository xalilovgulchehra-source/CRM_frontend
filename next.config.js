/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://onrender.com',
  },
  trailingSlash: true,
}

module.exports = nextConfig
