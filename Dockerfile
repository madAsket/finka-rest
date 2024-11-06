FROM node
WORKDIR /app
COPY package.json .
COPY .env .
RUN npm install
COPY ./src /app/src
CMD npm run dev