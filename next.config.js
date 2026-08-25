/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Пробуем вариант с префиксом api и правильными слешами
    NEXT_PUBLIC_API_URL: 'https://onrender.com',
  },
  // Этот блок поможет автоматически убирать двойные слеши, если они возникнут
  trailingSlash: true, 
}

module.exports = nextConfig
