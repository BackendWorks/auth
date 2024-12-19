FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package.json yarn.lock ./

COPY prisma ./prisma

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN mkdir -p dist/common/templates && cp -r src/common/templates/* dist/common/templates/

EXPOSE 9001

CMD [ "yarn", "dev" ]