FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn generate

RUN yarn build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

RUN yarn install --production --frozen-lockfile

EXPOSE 9001

CMD [ "yarn", "start" ]
