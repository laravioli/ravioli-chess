FROM node:22-bullseye-slim AS base
WORKDIR /usr/local/app

FROM base AS client-base
COPY package.json yarn.lock ./
COPY packages ./packages
RUN --mount=type=cache,id=yarn,target=/usr/local/share/.cache/yarn \
    yarn install
COPY eslint.config.js vite.config.js postcss.config.cjs ./
COPY public ./public
COPY src ./src

FROM client-base AS client-dev
EXPOSE 5173
CMD ["yarn", "dev","--host", "0.0.0.0", "--no-open"]