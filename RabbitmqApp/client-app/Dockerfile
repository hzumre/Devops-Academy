FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

RUN npm install amqplib

CMD ["npm", "start"]
