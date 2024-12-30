FROM finka-front:latest as builder

FROM nginx:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/finka.conf
COPY --from=builder /app/finka-front/dist /usr/share/nginx/html