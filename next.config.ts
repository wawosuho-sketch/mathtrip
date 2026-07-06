import type { NextConfig } from "next";

// basePath: Vercel 배포 시에는 비워두면 됩니다(기본값).
// GitHub Pages로 배포할 때만 NEXT_PUBLIC_BASE_PATH="/저장소이름" 을 설정하세요.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
