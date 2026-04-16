FROM docker.io/node:24-alpine

ENV NODE_ENV=production
WORKDIR /schulcloud-calendar

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force
COPY src ./src

CMD ["npm", "start"]
