FROM spcy-v4-web-base:dev AS build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/entry-points/index.html /usr/share/nginx/html/
COPY ./default.conf /etc/nginx/conf.d/
