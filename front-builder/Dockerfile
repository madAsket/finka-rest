FROM node:20.12.1 as front-builder
RUN echo $(ls -1)
WORKDIR /app
RUN echo $(ls -1)
COPY front-source /app/front-dist
WORKDIR /app/front-dist
RUN npm install
RUN npm run build