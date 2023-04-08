/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ipfs.io',
                port: '',
                pathname: '/**'
            }
        ]
    }
};

module.exports = nextConfig;
