# syntax=docker/dockerfile:1-labs

FROM node:20-alpine AS build
ARG mode=production
WORKDIR /app
COPY --exclude=dist/* --exclude=node_modules/* --exclude=__test__/* . .
RUN apk add --no-cache git python3 py3-pip make build-base && \
    npm install -g pnpm@8 && pnpm i && pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html