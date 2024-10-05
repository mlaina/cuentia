/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Advertencia: esto deshabilitará la validación de tipos de TypeScript durante la compilación
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
