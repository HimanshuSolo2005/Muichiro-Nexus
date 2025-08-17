/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'mammoth': 'commonjs mammoth'
      })
      
      // Ignore test files and other problematic paths
      config.resolve.alias = {
        ...config.resolve.alias,
        'test': false,
      }
      
      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    // Ignore specific problematic files
    config.module.rules.push({
      test: /\.pdf$/,
      use: 'ignore-loader'
    })
    
    return config
  }
}

export default nextConfig
