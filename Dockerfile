FROM node:16.16.0-alpine
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN mkdir -p /var/www/auth
WORKDIR /var/www/auth
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
CMD npm start
