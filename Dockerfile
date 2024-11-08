FROM docker.io/node:22-alpine

ENV NODE_ENV=production
WORKDIR /schulcloud-calendar

COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src

CMD npm start
