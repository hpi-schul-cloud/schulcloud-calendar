#FROM node:8.17.0
from node:12-alpine

WORKDIR /schulcloud-calendar
COPY . .
RUN chown -R 1000:1000 /schulcloud-calendar && npm install

CMD npm start
