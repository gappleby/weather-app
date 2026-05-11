/** @type {import('next').NextConfig} */

const nextConfig = {
    // standalone for Docker, undefined lets the Pages workflow use static export
    output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
    env: {
        NEXT_PUBLIC_OPENWEATHERMAP_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
    },
};

export default nextConfig;
