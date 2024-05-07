ARG NODE_VERSION
ARG ALPINE_VERSION
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as build

RUN npm i -g pnpm

COPY . /app

WORKDIR /app

RUN pnpm i

ENTRYPOINT ["pnpm", "start"]
