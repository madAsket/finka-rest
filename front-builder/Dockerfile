FROM node:20.12.1 as front-builder
WORKDIR /app
RUN apt-get update && apt-get install -y git openssh-client
RUN mkdir -p /root/.ssh
COPY .ssh/config /root/.ssh/config
RUN chmod 600 /root/.ssh/config
RUN mkdir -p /root/.ssh && ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN git clone git@github.com:madAsket/finka-front.git .
RUN npm install
RUN npm run build