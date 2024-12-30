FROM front:latest as builder

FROM nginx:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/finka.conf
COPY --from=builder /app/dist /usr/share/nginx/html