# syntax=docker/dockerfile:1-labs

FROM node:20-alpine
ARG MODE=development
RUN apk add --no-cache git python3 py3-pip make build-base
ENV VITE_BASE_URL=http://localhost:80

WORKDIR /app
COPY --exclude=dist/* --exclude=node_modules/* --exclude=__tests__/* . .
RUN npm install -g pnpm@8 && pnpm i && pnpm build --mode $MODE
