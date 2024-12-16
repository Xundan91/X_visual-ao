/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  transpilePackages: ["react-blockly"],
  basePath: "/visual-ao",
};

export default nextConfig;
