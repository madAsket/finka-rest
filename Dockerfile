FROM node:20.12.1
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY .sequelizerc .
COPY .env .
RUN npm install
RUN npm install sequelize-cli
COPY ./src /app/src