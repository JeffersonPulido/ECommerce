/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

module.exports = {
    // Otras configuraciones de Next.js aquí si las tienes
    ...nextConfig,
    // Configuración específica de next-pwa
    webpack: (config, { isServer, dev }) => {
        if (!isServer && !dev) {
            config.plugins.push(
                withPWA({
                    pwa: {
                        dest: "public",
                        register: true,
                        skipWaiting: true,
                        disable: process.env.NODE_ENV === "development",
                    },
                    runtimeCaching,
                })
            );
        }

        return config;
    },
};
