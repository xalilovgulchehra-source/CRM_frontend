/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "https://crm-backend-api-zl4c.onrender.com/api",
  },
  trailingSlash: true,
}

module.exports = nextConfig
