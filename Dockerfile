#FROM node:8.17.0
FROM node:lts-buster

WORKDIR /schulcloud-calendar

RUN apt-get update -y && \ 
apt-get install -y postgresql-client-11 make

COPY . .

RUN npm install

CMD ["bin/sh", "startup.sh"]
