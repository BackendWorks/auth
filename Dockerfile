FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 9001

CMD [ "yarn", "dev" ]
