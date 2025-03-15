import { execSync } from 'child_process';
import packageJson from "./package.json" assert { type: "json" };


const commitHash = execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // basePath: "/visual-ao",
  transpilePackages: ["react-blockly"],
  images: {
    unoptimized: true
  }, env: { commitHash, version: packageJson.version }
};

export default nextConfig;
