import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.BASE,
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
    ],
    resolve: {
      alias: {
        src: resolve('src'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    server: {
      origin: 'http://localhost:5173',
      open: '/',

      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },

      proxy: {
        '^/(\\w+)?$': {
          target: env.BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(path, ''),
        },
      },
    },

    build: {
      manifest: 'manifest.json',
      rollupOptions: {
        input: 'src/main.jsx',
        output: {
          manualChunks(id) {
            if (id.includes('mantine')) {
              return 'mantine';
            }
          },
        },
      },
      cssCodeSplit: false,
    },
    esbuild: {
      legalComments: 'eof',
    },
  };
});
