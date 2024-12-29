FROM front:latest as builder

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/finka.conf
COPY --from=builder /build/dist /usr/share/nginx/html