FROM node:20.12.1 as front-builder
WORKDIR /app
RUN apt-get update && apt-get install -y git openssh-client
RUN mkdir -p /root/.ssh
COPY front-builder/ssh/config /root/.ssh/config
COPY front-builder/ssh/id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa /root/.ssh/config
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN git clone git@github.com:madAsket/finka-front.git .
RUN npm install
RUN npm run build