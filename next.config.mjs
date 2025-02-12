import { execSync } from 'child_process';

const commitHash = execSync('git log --pretty=format:"%h" -n1')
  .toString()
  .trim();


/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["react-blockly"],
  images: {
    unoptimized: true
  }, env: {
    commitHash
  }
};

export default nextConfig;
