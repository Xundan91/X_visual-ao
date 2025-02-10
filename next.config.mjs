/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["react-blockly"],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
