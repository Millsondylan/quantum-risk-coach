import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['ccxt'],
    include: ['ws']
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      external: [
        'http',
        'https', 
        'crypto',
        'zlib',
        'stream',
        'net',
        'tls',
        'fs',
        'path',
        'os',
        'querystring',
        'http-proxy-agent',
        'https-proxy-agent',
        'socks-proxy-agent',
        'events',
        'assert',
        'buffer',
        'url',
        'util',
        'node:http',
        'node:https',
        'node:crypto',
        'node:zlib',
        'node:stream',
        'node:net',
        'node:tls',
        'node:fs',
        'node:path',
        'node:os',
        'node:querystring',
        'node:events',
        'node:assert',
        'node:buffer',
        'node:url',
        'node:util'
      ],
      output: {
        globals: {
          'http': 'null',
          'https': 'null',
          'crypto': 'null',
          'zlib': 'null',
          'stream': 'null',
          'net': 'null',
          'tls': 'null',
          'fs': 'null',
          'path': 'null',
          'os': 'null',
          'querystring': 'null',
          'http-proxy-agent': 'null',
          'https-proxy-agent': 'null',
          'socks-proxy-agent': 'null',
          'events': 'null',
          'assert': 'null',
          'buffer': 'null',
          'url': 'null',
          'util': 'null',
          'node:http': 'null',
          'node:https': 'null',
          'node:crypto': 'null',
          'node:zlib': 'null',
          'node:stream': 'null',
          'node:net': 'null',
          'node:tls': 'null',
          'node:fs': 'null',
          'node:path': 'null',
          'node:os': 'null',
          'node:querystring': 'null',
          'node:events': 'null',
          'node:assert': 'null',
          'node:buffer': 'null',
          'node:url': 'null',
          'node:util': 'null'
        },
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
}));
