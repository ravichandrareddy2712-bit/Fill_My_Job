import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/n8n-webhook',
        destination: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start',
      },
    ];
  },
};

export default nextConfig;
