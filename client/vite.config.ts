import { defineConfig, loadEnv, type ViteDevServer } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig(({ mode }) => {
  const { BACKEND_DOMAIN } = loadEnv(mode, process.cwd(), '');

  return {
    base: '/static/',
    plugins: [
      react(),
      babel({ presets: [decoratorPreset({ version: '2023-11' })] }),
      devServerConfig(),
    ],
    css: { modules: { localsConvention: 'camelCase' } },
    resolve: {
      tsconfigPaths: true,
      alias: {
        'src': resolve(__dirname, 'src'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    server: {
      origin: 'http://localhost:5173',
      open: false,
      proxy: {
        '/socket': {
          target: `ws://${BACKEND_DOMAIN}`,
          changeOrigin: false,
          ws: true,
          //leakage if backend return 403
        },
        '/api': {
          target: `http://${BACKEND_DOMAIN}`,
          changeOrigin: false,
        },
        '^/(\\w+)?(/\\w+)?$': {
          target: `http://${BACKEND_DOMAIN}`,
          changeOrigin: false,
          secure: false,
        },
      },
    },

    build: {
      manifest: 'manifest.json',
      rolldownOptions: {
        input: { main: 'src/main.tsx', theme: 'src/core/boot/theme.css' },

        output: {
          manualChunks(id) {
            if (id.includes('mantine')) return 'client.chunk.1';
            if (id.includes('mobx')) return 'client.chunk.2';
          },
        },
      },
    },
  };
});

function decoratorPreset(options: Record<string, unknown>) {
  return {
    preset: () => ({
      plugins: [['@babel/plugin-proposal-decorators', options]],
    }),
    rolldown: {
      // Only run this transform if the file contains a decorator.
      filter: {
        code: '@',
      },
    },
  };
}
const devServerConfig = () => ({
  name: 'dev-server-config',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.includes('stockfish'))
        res.setHeader('cross-origin-embedder-policy', 'require-corp');
      if (req.url && req.url.endsWith('.nnue'))
        res.setHeader('Content-Type', 'application/octet-stream');

      next();
    });
  },
});
