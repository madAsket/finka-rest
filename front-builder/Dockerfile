FROM node:20.12.1 as front-builder
WORKDIR /app
COPY /home/front-source /app/front-dist
WORKDIR /app/front-dist
RUN npm install
RUN npm run build