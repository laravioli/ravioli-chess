import { defineConfig, loadEnv, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const { BACKEND_DOMAIN } = loadEnv(mode, process.cwd(), '');
  const wsTarget = `ws://${BACKEND_DOMAIN}`;
  const httpTarget = `http://${BACKEND_DOMAIN}`;

  return {
    base: '/static/',
    plugins: [
      react({
        babel: {
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              {
                version: '2023-05',
              },
            ],
          ],
        },
      }),
      tsconfigPaths(),
      sfPlugin(),
    ],
    css: { modules: { localsConvention: 'camelCase' } },
    resolve: {
      alias: {
        'src': resolve(__dirname, 'src'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    server: {
      origin: 'http://localhost:5173',
      open: '/',
      proxy: {
        '/socket': {
          target: wsTarget,
          changeOrigin: true,
          ws: true,
        },
        '/api': {
          target: httpTarget,
          changeOrigin: true,
        },
        '^/(\\w+)?(/\\w+)?$': {
          target: httpTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      manifest: 'manifest.json',
      rollupOptions: {
        input: { main: 'src/main.tsx', theme: 'src/core/boot/theme.css' },

        output: {
          manualChunks(id) {
            if (id.includes('mantine')) return 'client.chunk.1';
            if (id.includes('mobx')) return 'client.chunk.2';
          },
        },
      },
    },
    esbuild: {
      legalComments: 'eof',
    },
  };
});

const sfPlugin = () => ({
  name: 'sf-headers',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.includes('stockfish'))
        res.setHeader('cross-origin-embedder-policy', 'require-corp');
      next();
    });
  },
});
