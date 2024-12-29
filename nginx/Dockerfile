FROM node:20.12.1 as builder
WORKDIR /build
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/finka.conf
COPY --from=builder /build/dist /usr/share/nginx/html