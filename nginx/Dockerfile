FROM node:20.12.1 as builder
WORKDIR /app
COPY ../finka-front .
WORKDIR /app/finka-front
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/finka.conf
COPY --from=builder /app/finka-front/dist /usr/share/nginx/html