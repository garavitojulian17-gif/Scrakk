/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/scrakk-editor', // Cambia esto por el nombre de tu repositorio
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
