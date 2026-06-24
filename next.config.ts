import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/n8n-webhook',
        destination: 'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start',
      },
    ];
  },
};

export default nextConfig;
