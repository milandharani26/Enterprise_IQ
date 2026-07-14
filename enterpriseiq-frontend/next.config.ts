import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load environment variables from the parent directory (root .env)
loadEnvConfig(path.join(process.cwd(), ".."));

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
