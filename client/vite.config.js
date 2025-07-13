import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const { BACKEND_DOMAIN } = loadEnv(mode, process.cwd(), "");
  const wsTarget = `ws://${BACKEND_DOMAIN}`;
  const httpTarget = `http://${BACKEND_DOMAIN}`;

  return {
    base: "/static/web/",
    plugins: [
      react({
        babel: {
          plugins: [
            [
              "@babel/plugin-proposal-decorators",
              {
                version: "2023-05",
              },
            ],
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        src: resolve("src"),
        "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      },
    },
    server: {
      origin: "http://localhost:5173",
      open: "/",

      headers: {
        "cross-origin-opener-policy": "same-origin",
        "cross-origin-embedder-policy": "credentialless",
      },

      proxy: {
        "/taxi": {
          target: wsTarget,
          changeOrigin: false,
          ws: true,
        },
        "/api": {
          target: httpTarget,
          changeOrigin: false,
        },
        "^/(\\w+)?$": {
          target: httpTarget,
          changeOrigin: false,
          secure: false,
          rewrite: (path) => path.replace(path, ""),
          configure: (proxy, _options) => {
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              _res.setHeader("cross-origin-embedder-Policy", "credentialless");
            });
          },
        },
      },
    },

    build: {
      manifest: "manifest.json",
      rollupOptions: {
        input: { main: "src/main.jsx", theme: "src/main/boot/theme.css" },

        output: {
          manualChunks(id) {
            if (id.includes("mantine")) {
              return "mantine";
            }
          },
        },
      },
    },
    esbuild: {
      legalComments: "eof",
    },
  };
});
