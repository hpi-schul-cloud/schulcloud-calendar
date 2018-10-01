FROM node:8.12.0

WORKDIR /schulcloud-calendar
COPY . .
RUN npm install

CMD npm start
