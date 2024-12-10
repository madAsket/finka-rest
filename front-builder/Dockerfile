FROM node:20.12.1 as front-builder
WORKDIR /app
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/madAsket/finka-front.git .
RUN npm install
RUN npm run build