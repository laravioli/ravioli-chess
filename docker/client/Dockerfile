FROM node:22-bullseye-slim AS base
WORKDIR /usr/local/app

FROM base AS client-base
COPY package.json yarn.lock ./
RUN --mount=type=cache,id=yarn,target=/usr/local/share/.cache/yarn \
    yarn install
COPY eslint.config.js vite.config.ts postcss.config.cjs ./
COPY tsconfig*.json ./
COPY public ./public

FROM client-base AS client-dev
EXPOSE 5173
CMD ["yarn", "dev","--host", "0.0.0.0", "--no-open"]