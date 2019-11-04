FROM node:8.16.0

WORKDIR /schulcloud-calendar
COPY . .
RUN chown -R 1000:1000 /schulcloud-calendar && npm install

CMD npm start
